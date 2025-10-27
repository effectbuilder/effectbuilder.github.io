try {
  const { test, expect } = require('@playwright/test');
  console.log('Successfully required @playwright/test');
} catch (e) {
  console.error('Failed to require @playwright/test:', e);
  console.error('Node path:', require.resolve.paths('@playwright/test'));
}
