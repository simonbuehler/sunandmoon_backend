# <img src="src/img/logo.svg" alt="logo" height="48px"/> Sun and Moon Datasource Backend Plugin for Grafana

## Overview

The **Sun and Moon Datasource Backend Plugin** for Grafana provides astronomical metrics and events for the sun and moon. This Go backend plugin calculates position, illumination, and event times such as sunrise, sunset, moonrise, and moonset. It is a port of the original [Grafana Sun and Moon Datasource](https://github.com/fetzerch/grafana-sunandmoon-datasource) using the [Suncalc Go library](https://github.com/sixdouglas/suncalc).

### Why This Plugin?

This backend version was developed to address the limitations of frontend-only plugins, particularly their incompatibility with **public dashboards** in Grafana. By handling the calculations on the backend, this plugin is fully functional for public dashboards, making it ideal for shared or embedded use cases.

## Features

### Metrics

- **Sun Position**: Altitude and azimuth in degrees
- **Moon Position**: Altitude and azimuth in degrees
- **Moon Illumination**: Percentage (0-100%)
- **Moon Distance**: Distance from Earth in kilometers
- **Sun Maximum Altitude**: Daily maximum altitude

### Events

Display solar and lunar events as time series markers or in table format:

- **Solar Events**: Sunrise, sunset, dawn, dusk, nautical dawn/dusk, solar noon, nadir
- **Lunar Events**: Moonrise, moonset

### Backend Processing

- All calculations performed server-side
- Compatible with Grafana public dashboards
- Supports variable latitude/longitude per query

## Installation

### From Grafana Catalog (Recommended - Coming Soon)

Once published, install directly from Grafana:

```bash
grafana-cli plugins install simonbuehler-sunandmoon-datasource
```

### Manual Installation

1. **Download the Plugin**:

   - Download the latest version from [GitHub Releases](https://github.com/simonbuehler/sunandmoon_backend/releases)

2. **Install the Plugin**:

   - Extract and place in the Grafana plugins directory:
     ```bash
     unzip simonbuehler-sunandmoon-datasource-*.zip
     sudo mv simonbuehler-sunandmoon-datasource /var/lib/grafana/plugins/
     ```

3. **Configure Grafana** (if unsigned):

   - For unsigned development versions, edit `grafana.ini`:
     ```ini
     [plugins]
     allow_loading_unsigned_plugins = simonbuehler-sunandmoon-datasource
     ```

4. **Restart Grafana**:
   ```bash
   sudo systemctl restart grafana-server
   ```

## Usage

1. **Add the Datasource**:

   - Go to **Configuration > Data Sources** in Grafana, click **Add Data Source**, and select **Sun and Moon Datasource Backend** from the list.

2. **Configure the Datasource**:

   - Set default latitude and longitude for calculations. These defaults can be overridden per query if needed.
   - The plugin will attempt to use your browser's geolocation to auto-fill coordinates.

3. **Create Panels**:

   **For Metrics:**

   - Add a Time Series panel
   - Select metrics like `sun_altitude`, `moon_illumination`, `moon_distance`, etc.
   - Visualize position and illumination changes over time

   **For Events (as markers):**

   - Add a Time Series panel with your base metric (e.g., `sun_altitude`)
   - Add a second query with events like `sunrise`, `sunset`
   - Set event series to display as **Points** or **Bars** to show vertical markers

   **For Events (as table):**

   - Add a Table panel
   - Select multiple events: `sunrise`, `sunset`, `moonrise`, `moonset`, etc.
   - View event times in a structured table format

## Development

### Prerequisites

- Go 1.21+
- Node.js 18+
- Docker & Docker Compose

### Build

**Frontend (TypeScript/React):**

```bash
npm install
npm run dev  # Watch mode for development
npm run build  # Production build
```

**Backend (Go):**

```bash
export GOOS=linux GOARCH=amd64
go build -o dist/gpx_sunandmoon_linux_amd64 ./pkg
```

### Local Development with Docker

```bash
docker compose up
# Grafana runs at http://localhost:3000
# Default credentials: admin/admin
```

## Credits

- **Original Plugin**: [fetzerch/grafana-sunandmoon-datasource](https://github.com/fetzerch/grafana-sunandmoon-datasource)
- **Suncalc Library**: [sixdouglas/suncalc](https://github.com/sixdouglas/suncalc)
- **Author**: Simon Bühler

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests on [GitHub](https://github.com/simonbuehler/sunandmoon_backend).

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
