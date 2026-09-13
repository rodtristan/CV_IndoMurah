const { chromium } = require('@playwright/test');

async function captureOriginal() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  console.log('Capturing original ketoko website...');

  try {
    // Go to login page
    await page.goto('https://pos.ketoko.co.id', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // Take screenshot of login page
    await page.screenshot({ path: 'D:/CV_IndoMurah/ketoko-login-page.png', fullPage: false });
    console.log('Saved: ketoko-login-page.png');

    // Get page structure
    const html = await page.content();
    console.log('Page loaded successfully');

  } catch (error) {
    console.error('Error:', error.message);
  }

  await browser.close();
  console.log('Done!');
}

captureOriginal();
