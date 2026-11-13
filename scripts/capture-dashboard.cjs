const { chromium } = require('playwright');
const fs = require('fs');
async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });
    page.on('pageerror', error => console.error('Page error:', error.message));
    await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.locator('#line-chart-monthly-fines svg').first().waitFor({ state: 'visible', timeout: 30000 });
    await page.locator('#choropleth svg').first().waitFor({ state: 'visible', timeout: 30000 });
    fs.mkdirSync('docs/screenshots', { recursive: true });
    const views = [
      ['#section-figures', 'overview.png'],
      ['#section-monthly', 'monthly-trends.png'],
      ['#section-choropleth', 'jurisdiction-map.png']
    ];
    for (const [selector, name] of views) {
      await page.locator(selector).screenshot({ path: 'docs/screenshots/' + name, animations: 'disabled' });
      console.log('Saved screenshot:', name);
    }
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exit(1); });
