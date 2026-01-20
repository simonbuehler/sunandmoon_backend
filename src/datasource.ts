import { DataSourceInstanceSettings, CoreApp, ScopedVars } from '@grafana/data';
import { DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';

import { SunAndMoonQuery, SunAndMoonDataSourceOptions, DEFAULT_QUERY } from './types';

export class DataSource extends DataSourceWithBackend<SunAndMoonQuery, SunAndMoonDataSourceOptions> {
  // Define default latitude and longitude if not provided
  private defaultLatitude: number;
  private defaultLongitude: number;

  constructor(instanceSettings: DataSourceInstanceSettings<SunAndMoonDataSourceOptions>) {
    super(instanceSettings);

    // Fetch defaults from jsonData in instance settings
    this.defaultLatitude = instanceSettings.jsonData?.latitude || 0; // Replace 0 with a suitable default
    this.defaultLongitude = instanceSettings.jsonData?.longitude || 0; // Replace 0 with a suitable default
  }

  // Returns the default query
  getDefaultQuery(_: CoreApp): Partial<SunAndMoonQuery> {
    return {
      ...DEFAULT_QUERY,
      latitude: this.defaultLatitude.toString(),
      longitude: this.defaultLongitude.toString(),
    };
  }

  // Apply template variables
  applyTemplateVariables(query: SunAndMoonQuery, scopedVars: ScopedVars) {
    return {
      ...query,
      latitude: getTemplateSrv().replace(query.latitude?.toString() || this.defaultLatitude.toString(), scopedVars),
      longitude: getTemplateSrv().replace(query.longitude?.toString() || this.defaultLongitude.toString(), scopedVars),
      target: query.target?.map((t) => getTemplateSrv().replace(t, scopedVars)),
    };
  }

  // Filters the query to execute only valid queries
  filterQuery(query: SunAndMoonQuery): boolean {
    return Array.isArray(query.target) && query.target.length > 0;
  }
}
