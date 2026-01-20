package plugin

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"strconv"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/simonbuehler/sunandmoon_backend/pkg/models"
	"github.com/sixdouglas/suncalc"
)

var (
	_ backend.QueryDataHandler      = (*Datasource)(nil)
	_ backend.CheckHealthHandler    = (*Datasource)(nil)
	_ instancemgmt.InstanceDisposer = (*Datasource)(nil)
)

func NewDatasource(_ context.Context, settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	var jsonData struct {
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
	}

	// Parse settings to get the default latitude and longitude
	err := json.Unmarshal(settings.JSONData, &jsonData)
	if err != nil {
		return nil, err
	}

	return &Datasource{
		Latitude:  jsonData.Latitude,  // Set the default latitude
		Longitude: jsonData.Longitude, // Set the default longitude
	}, nil
}

func (d *Datasource) Dispose() {
	// Clean up datasource instance resources.
}

// Datasource implements the Grafana backend Datasource
type Datasource struct {
	Latitude  float64
	Longitude float64
}

type queryModel struct {
	Latitude  string   `json:"latitude"`
	Longitude string   `json:"longitude"`
	Target    []string `json:"target"`
}

// QueryData handles multiple queries
func (d *Datasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	response := backend.NewQueryDataResponse()

	// Iterate over each query
	for _, query := range req.Queries {

		// Assuming the interval is provided in milliseconds, extract it from the request
		intervalMs := query.Interval.Milliseconds() // Get the interval from the request (assuming it's a duration)

		// Ensure a default interval in case none is provided
		if intervalMs == 0 {
			intervalMs = 1000 * 60 * 30 // Default to 30 minutes if no interval is provided
		}

		// Parse the query JSON to get metrics and annotations
		metrics, annotations := getMetricsAndAnnotations(query)
		latitude, longitude, _ := d.GetLatLon(query)

		// Process each metric and add data points to frames
		if len(metrics) > 0 {
			for _, metric := range metrics {

				// Retrieve the metric configuration
				metricDef, ok := models.SunAndMoonMetrics[metric]
				if !ok {
					return nil, fmt.Errorf("unknown metric: %s", metric) // Return nil for the response and the error
				}
				// Convert Min value to *data.ConfFloat64
				minValue := data.ConfFloat64(metricDef.Config.Min)

				// Create a new Frame and set the RefID and name (similar to the TypeScript example)
				frame := data.NewFrame(metricDef.Title) // Set the frame name using the metric's title

				// Add fields for Time and Value to the Frame
				frame.Fields = append(frame.Fields,
					data.NewField("Time", nil, []time.Time{}), // Time field, equivalent to FieldType.time in TS
					data.NewField("Value", nil, []float64{}).SetConfig(&data.FieldConfig{
						Unit:     metricDef.Config.Unit,                        // Use the unit from the metric configuration
						Decimals: uint16Ptr(uint16(metricDef.Config.Decimals)), // Set decimal places as *uint16
						Min:      &minValue,                                    // Set minimum value as a pointer to data.ConfFloat64
					}),
				)

				// Iterate over the time range using the interval from the request
				for t := query.TimeRange.From; t.Before(query.TimeRange.To); t = t.Add(time.Duration(intervalMs) * time.Millisecond) {
					var value float64

					// Use dummy values for now
					switch metric {
					case "moon_illumination":
						value = suncalc.GetMoonIllumination(t).Fraction

					case "moon_altitude":
						// Get the moon's altitude (in radians) and convert it to degrees
						value = suncalc.GetMoonPosition(t, latitude, longitude).Altitude * (180 / math.Pi)

					case "moon_azimuth":
						// Get the moon's azimuth (in radians) and convert it to degrees, adding 180 degrees
						value = suncalc.GetMoonPosition(t, latitude, longitude).Azimuth*(180/math.Pi) + 180

					case "moon_distance":
						// Get the distance to the moon in kilometers
						value = suncalc.GetMoonPosition(t, latitude, longitude).Distance

					case "sun_altitude":
						// Get the sun's altitude (in radians) and convert it to degrees
						value = suncalc.GetPosition(t, latitude, longitude).Altitude * (180 / math.Pi) // Convert radians to degrees

					case "sun_azimuth":
						// Get the sun's azimuth (in radians) and convert it to degrees, adding 180 degrees
						value = suncalc.GetPosition(t, latitude, longitude).Azimuth*(180/math.Pi) + 180 // Convert radians to degrees and add 180

					case "sun_maximum_altitude":
						// Get the solar noon time, then calculate the sun's altitude at solar noon
						solarNoon := suncalc.GetTimes(t, latitude, longitude)[suncalc.SolarNoon].Value
						value = suncalc.GetPosition(solarNoon, latitude, longitude).Altitude * (180 / math.Pi) // Convert radians to degrees
					}

					// Append dummy values to the frame
					frame.AppendRow(t, value)
				}

				// Check if a response exists for this RefID
				dataResponse, exists := response.Responses[query.RefID]
				if !exists {
					dataResponse = backend.DataResponse{
						Frames: []*data.Frame{},
					}
				}
				// Append the frame to the existing frames for the query
				dataResponse.Frames = append(dataResponse.Frames, frame)

				// Reassign the dataResponse back to the map
				response.Responses[query.RefID] = dataResponse
			}
		}

		// Process each annotation and add data to frames
		if len(annotations) > 0 {
			for _, annotation := range annotations {
				frame := data.NewFrame(models.SunAndMoonAnnotations[annotation].Title,
					data.NewField("Time", nil, []time.Time{}),
					data.NewField("Value", nil, []float64{}),
				)

				// Mark frame as time series for visualization
				frame.Meta = &data.FrameMeta{
					PreferredVisualization: "graph",
				}

				// Iterate over each day in the time range
				for t := query.TimeRange.From; t.Before(query.TimeRange.To); t = t.AddDate(0, 0, 1) {
					var eventTime time.Time
					solarTimes := suncalc.GetTimes(t, latitude, longitude)
					moonTimes := suncalc.GetMoonTimes(t, latitude, longitude, false)

					switch annotation {
					case "sunrise":
						eventTime = solarTimes[suncalc.Sunrise].Value
					case "sunriseEnd":
						eventTime = solarTimes[suncalc.SunriseEnd].Value
					case "goldenHour":
						eventTime = solarTimes[suncalc.GoldenHour].Value
					case "goldenHourEnd":
						eventTime = solarTimes[suncalc.GoldenHourEnd].Value
					case "solarNoon":
						eventTime = solarTimes[suncalc.SolarNoon].Value
					case "sunsetStart":
						eventTime = solarTimes[suncalc.SunsetStart].Value
					case "sunset":
						eventTime = solarTimes[suncalc.Sunset].Value
					case "dusk":
						eventTime = solarTimes[suncalc.Dusk].Value
					case "nauticalDusk":
						eventTime = solarTimes[suncalc.NauticalDusk].Value
					case "nauticalDawn":
						eventTime = solarTimes[suncalc.NauticalDawn].Value
					case "night":
						eventTime = solarTimes[suncalc.Night].Value
					case "nightEnd":
						eventTime = solarTimes[suncalc.NightEnd].Value
					case "nadir":
						eventTime = solarTimes[suncalc.Nadir].Value
					case "dawn":
						eventTime = solarTimes[suncalc.Dawn].Value
					case "moonrise":
						eventTime = moonTimes.Rise
					case "moonset":
						eventTime = moonTimes.Set
					case "noon": //FIXME: Always interpreted as UTC
						// Set to 12:00:00 PM for noon
						eventTime = time.Date(t.Year(), t.Month(), t.Day(), 12, 0, 0, 0, time.Local)
					case "midnight": //FIXME: Always interpreted as UTC
						// Set to 12:00:00 AM for midnight
						eventTime = time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.Local)
					}

					// Check if eventTime is valid (not zero)
					if !eventTime.IsZero() {
						// Return a fixed value (e.g., 1.0) so it can be displayed as a marker
						frame.AppendRow(eventTime, 1.0)
					}
				}

				// Check if a response exists for this RefID
				dataResponse, exists := response.Responses[query.RefID]
				if !exists {
					dataResponse = backend.DataResponse{
						Frames: []*data.Frame{},
					}
				}
				// Append the frame to the existing frames for the query
				dataResponse.Frames = append(dataResponse.Frames, frame)

				// Reassign the dataResponse back to the map
				response.Responses[query.RefID] = dataResponse
			}
		}
	}

	return response, nil
}

// Helper function to convert int to *uint16
func uint16Ptr(i uint16) *uint16 {
	return &i
}

func (d *Datasource) GetLatLon(query backend.DataQuery) (float64, float64, error) {
	var qm queryModel
	err := json.Unmarshal(query.JSON, &qm)
	if err != nil {
		return 0, 0, fmt.Errorf("error unmarshalling query JSON: %v", err)
	}
	// Fallback
	latitude := d.Latitude
	longitude := d.Longitude

	// Convert latitude and longitude from strings to float64
	if qm.Latitude != "" {
		latitude, err = strconv.ParseFloat(qm.Latitude, 64)
		if err != nil {
			return 0, 0, fmt.Errorf("invalid latitude: %v", err)
		}
	}

	if qm.Longitude != "" {
		longitude, err = strconv.ParseFloat(qm.Longitude, 64)
		if err != nil {
			return 0, 0, fmt.Errorf("invalid longitude: %v", err)
		}
	}

	return latitude, longitude, nil
}

// Helper function to get metrics and annotations from the query
func getMetricsAndAnnotations(query backend.DataQuery) ([]string, []string) {
	metrics := []string{}
	annotations := []string{}

	// Unmarshal the query and filter targets into metrics and annotations
	var qm models.SunAndMoonQuery
	_ = json.Unmarshal(query.JSON, &qm)

	for _, target := range *qm.Target {
		if _, ok := models.SunAndMoonMetrics[target]; ok {
			metrics = append(metrics, target)
		} else if _, ok := models.SunAndMoonAnnotations[target]; ok {
			annotations = append(annotations, target)
		}
	}
	return metrics, annotations
}

// CheckHealth verifies the datasource settings
func (d *Datasource) CheckHealth(_ context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	var errors []string

	// Check for valid latitude
	if d.Latitude < -90 || d.Latitude > 90 {
		errors = append(errors, "Latitude not in range -90 to +90.")
	}

	// Check for valid longitude
	if d.Longitude < -180 || d.Longitude > 180 {
		errors = append(errors, "Longitude not in range -180 to +180.")
	}

	// Return errors if any, else return success
	if len(errors) > 0 {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: fmt.Sprintf("Error: %s", errors),
		}, nil
	}

	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "Datasource added successfully.",
	}, nil
}
