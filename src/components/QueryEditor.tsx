import React, { ChangeEvent } from 'react';
import { InlineField, Input, Stack, MultiSelect } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from '../datasource';
import { SunAndMoonQuery, SunAndMoonDataSourceOptions } from '../types';
import { sunAndMoonMetrics, sunAndMoonAnnotations } from 'metrics';

// Typdefinition für die Props
type Props = QueryEditorProps<DataSource, SunAndMoonQuery, SunAndMoonDataSourceOptions>;

// Zusammenführen der Metrik- und Annotationsoptionen
const metrics = Object.keys({ ...sunAndMoonMetrics, ...sunAndMoonAnnotations }).map((key) => ({
  label: sunAndMoonMetrics[key]?.title || sunAndMoonAnnotations[key]?.title,
  value: key,
  description: sunAndMoonMetrics[key]?.text || sunAndMoonAnnotations[key]?.text,
})) as Array<SelectableValue<string>>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const onMetricChange = (selected: Array<SelectableValue<string>>) => {
    onChange({ ...query, target: selected.map((selection) => selection.value!) });
    onRunQuery(); // Führt die Abfrage aus
  };

  const onLatitudeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value) && value >= -90 && value <= 90) {
      onChange({ ...query, latitude: value.toString() });
      onRunQuery();
    }
  };
  
  const onLongitudeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value) && value >= -180 && value <= 180) {
      onChange({ ...query, longitude: value.toString() });
      onRunQuery();
    }
  };

  const { target, latitude, longitude } = query;

  return (
    <Stack direction={'column'}>
      {' '}
      {/* Set gap to 10 for better spacing between rows */}
      {/* Metrik-Auswahl */}
      <InlineField label="Metric">
        <MultiSelect
          inputId="editor-metrics"
          options={metrics}
          value={target}
          onChange={onMetricChange}
          placeholder="Select Metric"
        />
      </InlineField>
      {/* Latitude */}
      <InlineField label="Override Latitude" labelWidth={20}>
        <Input
          id="latitude"
          onChange={onLatitudeChange}
          value={latitude || ''}
          placeholder="Enter Latitude"
          width={32}
          type="number"
          step="0.1"
        />
      </InlineField>
      {/* Longitude */}
      <InlineField label="Override Longitude" labelWidth={20}>
        <Input
          id="longitude"
          onChange={onLongitudeChange}
          value={longitude || ''}
          placeholder="Enter Longitude"
          width={32}
          type="number"
          step="0.1"
        />
      </InlineField>
    </Stack>
  );
}
