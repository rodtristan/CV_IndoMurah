const { chromium } = require('@playwright/test');

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  console.log('Taking screenshot of original ketoko.co.id...');

  try {
    // Login page
    await page.goto('https://pos.ketoko.co.id', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.screenshot({ path: 'D:/CV_IndoMurah/ketoko-original-login.png', fullPage: false });
    console.log('Saved: ketoko-original-login.png');

    // Try to login and take dashboard screenshot
    await page.fill('#companyId, input[name="companyId"], input[placeholder*="ID"]', 'xiangyu');
    await page.fill('#userId, input[name="userId"], input[placeholder*="User"]', 'admin');
    await page.fill('#password, input[name="password"], input[type="password"]', 'GUSNA2906');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'D:/CV_IndoMurah/ketoko-original-dashboard.png', fullPage: false });
    console.log('Saved: ketoko-original-dashboard.png');

    // Navigate to dashboard
    await page.goto('https://pos.ketoko.co.id/dashboard', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.screenshot({ path: 'D:/CV_IndoMurah/ketoko-original-dashboard2.png', fullPage: false });
    console.log('Saved: ketoko-original-dashboard2.png');

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'D:/CV_IndoMurah/ketoko-original-error.png', fullPage: false });
  }

  await browser.close();
  console.log('Done!');
}

takeScreenshots();
