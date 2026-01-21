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

// Test to verify that 'Save & Test' fails if latitude is out of range
test('"Save & test" should fail when latitude is out of range', async ({
  createDataSourceConfigPage,
  readProvisionedDataSource,
  page,
}) => {
  const ds = await readProvisionedDataSource<SunAndMoonDataSourceOptions>({ fileName: 'datasources.yml' });
  const configPage = await createDataSourceConfigPage({ type: ds.type });

  // Set latitude out of valid range (-90 to 90)
  await page.getByLabel('Latitude').fill('100');
  await page.getByLabel('Longitude').fill('9.9910');

  // Save and test should fail due to invalid latitude
  await expect(configPage.saveAndTest()).not.toBeOK();
});

// Test to verify that 'Save & Test' fails if longitude is out of range
test('"Save & test" should fail when longitude is out of range', async ({
  createDataSourceConfigPage,
  readProvisionedDataSource,
  page,
}) => {
  const ds = await readProvisionedDataSource<SunAndMoonDataSourceOptions>({ fileName: 'datasources.yml' });
  const configPage = await createDataSourceConfigPage({ type: ds.type });

  // Set longitude out of valid range (-180 to 180)
  await page.getByLabel('Latitude').fill('48.3984');
  await page.getByLabel('Longitude').fill('200');

  // Save and test should fail due to invalid longitude
  await expect(configPage.saveAndTest()).not.toBeOK();
});
