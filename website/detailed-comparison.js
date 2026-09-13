const { chromium } = require('@playwright/test');

async function detailedComparison() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  console.log('Taking detailed screenshots...');

  try {
    // Our clone - login page
    await page.goto('http://localhost:3000/login', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.screenshot({ path: 'D:/CV_IndoMurah/compare-login-clone.png', fullPage: false });
    console.log('Saved: compare-login-clone.png');

    // Login to our clone
    await page.fill('input[id="companyId"]', 'xiangyu');
    await page.fill('input[id="userId"]', 'admin');
    await page.fill('input[id="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Our clone - dashboard
    await page.goto('http://localhost:3000/dashboard', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.screenshot({ path: 'D:/CV_IndoMurah/compare-dashboard-clone.png', fullPage: false });
    console.log('Saved: compare-dashboard-clone.png');

    // Get page structure info
    const headerInfo = await page.evaluate(() => {
      const header = document.querySelector('header');
      const sidebar = document.querySelector('aside');
      return {
        headerBg: window.getComputedStyle(header).backgroundColor,
        sidebarBg: window.getComputedStyle(sidebar).backgroundColor,
        sidebarWidth: sidebar ? sidebar.offsetWidth : 0
      };
    });
    console.log('Header bg:', headerInfo.headerBg);
    console.log('Sidebar bg:', headerInfo.sidebarBg);
    console.log('Sidebar width:', headerInfo.sidebarWidth);

  } catch (error) {
    console.error('Error:', error.message);
  }

  await browser.close();
  console.log('Done!');
}

detailedComparison();
