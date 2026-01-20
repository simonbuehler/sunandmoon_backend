import { DataSourceJsonData } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

// Query type sent to the backend
export interface SunAndMoonQuery extends DataQuery {
  target?: string[]; // Array of metrics to query
  latitude?: string; // Optional: Latitude as string (for editor input)
  longitude?: string; // Optional: Longitude as string (for editor input)
}

// Annotation query type
export interface SunAndMoonAnnotationQuery {
  target?: string[]; // Array of annotation events to query
  latitude?: string; // Optional: Latitude as string (for editor input)
  longitude?: string; // Optional: Longitude as string (for editor input)
}

// Default values for queries (metrics and optional default latitude/longitude)
export const DEFAULT_QUERY: Partial<SunAndMoonQuery> = {
  target: ['moon_illumination'], // Default metric for query
};

// Type for a single data point (time and value)
export interface DataPoint {
  time: number; // Timestamp as number (Unix time)
  value: number; // Value of the data point
}

// Response structure returned by the backend
export interface DataSourceResponse {
  datapoints: DataPoint[]; // Array of data points
}

/**
 * Options configured for each datasource instance.
 * These options can be set individually for each datasource in Grafana.
 */
export interface SunAndMoonDataSourceOptions extends DataSourceJsonData {
  latitude?: number; // Optional: Latitude (stored as number)
  longitude?: number; // Optional: Longitude (stored as number)
}
