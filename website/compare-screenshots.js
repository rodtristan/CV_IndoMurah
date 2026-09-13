const { chromium } = require('@playwright/test');

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  console.log('Taking screenshots of our clone...');

  try {
    // Login page
    await page.goto('http://localhost:3000/login', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.screenshot({ path: 'D:/CV_IndoMurah/our-clone-login.png', fullPage: false });
    console.log('Saved: our-clone-login.png');

    // Login
    await page.fill('input[id="companyId"]', 'xiangyu');
    await page.fill('input[id="userId"]', 'admin');
    await page.fill('input[id="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // Dashboard
    await page.goto('http://localhost:3000/dashboard', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.screenshot({ path: 'D:/CV_IndoMurah/our-clone-dashboard.png', fullPage: false });
    console.log('Saved: our-clone-dashboard.png');

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'D:/CV_IndoMurah/our-clone-error.png', fullPage: false });
  }

  await browser.close();
  console.log('Done!');
}

takeScreenshots();
