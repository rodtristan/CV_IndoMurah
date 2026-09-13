const { chromium } = require('playwright');

async function capturePages() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  
  const pages = [
    { url: 'http://localhost:3000/purchase/orders', file: 'our-purchase-orders.png' },
    { url: 'http://localhost:3000/purchase/price-history', file: 'our-purchase-price-history.png' },
    { url: 'http://localhost:3000/purchase/returns', file: 'our-purchase-returns.png' },
    { url: 'http://localhost:3000/sale/orders', file: 'our-sale-orders.png' },
    { url: 'http://localhost:3000/sale/price-history', file: 'our-sale-price-history.png' },
    { url: 'http://localhost:3000/sale/returns', file: 'our-sale-returns.png' },
    { url: 'http://localhost:3000/sale/points', file: 'our-sale-points.png' },
  ];
  
  for (const p of pages) {
    await page.goto(p.url, { waitUntil: 'networkidle' });
    await page.screenshot({ path: p.file, fullPage: false });
    console.log(`Captured: ${p.file}`);
  }
  
  await browser.close();
}

capturePages().catch(console.error);
