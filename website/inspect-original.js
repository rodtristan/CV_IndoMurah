const { chromium } = require('@playwright/test');

async function inspectOriginal() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  console.log('Inspecting original ketoko website structure...');

  try {
    await page.goto('https://pos.ketoko.co.id', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // Get all CSS colors used
    const colors = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const colorSet = new Set();
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          colorSet.add(`bg: ${style.backgroundColor}`);
        }
        if (style.color) {
          colorSet.add(`text: ${style.color}`);
        }
      });
      return Array.from(colorSet).slice(0, 50);
    });

    console.log('Colors found:');
    colors.forEach(c => console.log(c));

    // Get input fields info
    const inputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input')).map(inp => ({
        type: inp.type,
        placeholder: inp.placeholder,
        id: inp.id,
        name: inp.name
      }));
    });

    console.log('\nInput fields:');
    console.log(JSON.stringify(inputs, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }

  await browser.close();
  console.log('\nDone!');
}

inspectOriginal();
