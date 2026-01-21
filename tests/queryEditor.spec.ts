import { test, expect } from '@grafana/plugin-e2e';

test.describe('QueryEditor', () => {
  test('should display metric selector and location inputs', async ({ panelEditPage, readProvisionedDataSource }) => {
    const ds = await readProvisionedDataSource({ fileName: 'datasources.yml' });
    await panelEditPage.datasource.set(ds.name);

    // Verify that the Metric input is visible
    const metricInput = panelEditPage.getQueryEditorRow('A').locator('#editor-metrics');
    await expect(metricInput).toBeVisible();

    // Verify that Latitude input is visible
    const latitudeInput = panelEditPage.getQueryEditorRow('A').getByPlaceholder('Enter Latitude');
    await expect(latitudeInput).toBeVisible();

    // Verify that Longitude input is visible
    const longitudeInput = panelEditPage.getQueryEditorRow('A').getByPlaceholder('Enter Longitude');
    await expect(longitudeInput).toBeVisible();
  });

  test('should allow changing Latitude and Longitude values', async ({ panelEditPage, readProvisionedDataSource }) => {
    const ds = await readProvisionedDataSource({ fileName: 'datasources.yml' });
    await panelEditPage.datasource.set(ds.name);

    // Get the Latitude input and change it
    const latitudeInput = panelEditPage.getQueryEditorRow('A').getByPlaceholder('Enter Latitude');
    await latitudeInput.fill('45.0');
    await expect(latitudeInput).toHaveValue('45');

    // Get the Longitude input and change it
    const longitudeInput = panelEditPage.getQueryEditorRow('A').getByPlaceholder('Enter Longitude');
    await longitudeInput.fill('9.0');
    await expect(longitudeInput).toHaveValue('9');
  });
});
