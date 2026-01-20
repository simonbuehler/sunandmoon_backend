import { test, expect } from '@grafana/plugin-e2e';
import { SunAndMoonDataSourceOptions } from '../src/types';

test('"Save & test" should be successful when latitude and longitude are valid', async ({
  createDataSourceConfigPage,
  readProvisionedDataSource,
  page,
}) => {
  const ds = await readProvisionedDataSource<SunAndMoonDataSourceOptions>({ fileName: 'datasources.yml' });
  const configPage = await createDataSourceConfigPage({ type: ds.type });

  // Set valid latitude and longitude values
  await page.getByLabel('Latitude').fill(ds.jsonData.latitude?.toString() ?? '48.3984');
  await page.getByLabel('Longitude').fill(ds.jsonData.longitude?.toString() ?? '9.9910');
  
  // Save and test should be OK
  await expect(configPage.saveAndTest()).toBeOK();
});


// Test to verify that 'Save & Test' fails if latitude or longitude is not provided
test('"Save & test" should fail when latitude or longitude is missing', async ({
  createDataSourceConfigPage,
  readProvisionedDataSource,
  page,
}) => {
  const ds = await readProvisionedDataSource<SunAndMoonDataSourceOptions>({ fileName: 'datasources.yml' });
  const configPage = await createDataSourceConfigPage({ type: ds.type });

  // Leave latitude empty and set a valid longitude
  await page.getByLabel('Latitude').fill('');
  await page.getByLabel('Longitude').fill('9.9910');
  
  // Save and test should fail due to missing latitude
  await expect(configPage.saveAndTest()).not.toBeOK();
});


// Test to verify that entering non-numeric values into latitude and longitude fields results in an error
test('"Save & test" should fail with non-numeric latitude and longitude', async ({
  createDataSourceConfigPage,
  readProvisionedDataSource,
  page,
}) => {
  const ds = await readProvisionedDataSource<SunAndMoonDataSourceOptions>({ fileName: 'datasources.yml' });
  const configPage = await createDataSourceConfigPage({ type: ds.type });

  // Enter non-numeric values
  await page.getByLabel('Latitude').fill('latitude');
  await page.getByLabel('Longitude').fill('longitude');
  
  // Save and test should fail because the values are non-numeric
  await expect(configPage.saveAndTest()).not.toBeOK();
});
