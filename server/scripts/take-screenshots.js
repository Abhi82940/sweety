const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const screenshotsDir = path.resolve(__dirname, '../../screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function capture() {
  console.log(`Launching browser using: ${chromePath}`);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const baseUrl = 'http://localhost:5173';

  try {
    // 1. Landing Page
    console.log('Capturing Landing Page...');
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0', timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotsDir, '01_landing_page.png'), fullPage: true });

    // 2. Login Page
    console.log('Capturing Login Page...');
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle0', timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotsDir, '02_login_page.png') });

    // 3. Register Page
    console.log('Capturing Register Page...');
    await page.goto(`${baseUrl}/register`, { waitUntil: 'networkidle0', timeout: 15000 });
    await page.screenshot({ path: path.join(screenshotsDir, '03_register_page.png') });

    // 4. Log in
    console.log('Logging in with Demo Account...');
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle0', timeout: 15000 });
    // Click Fill Demo Info button
    const fillBtn = await page.$('button[type="button"]');
    if (fillBtn) {
      await fillBtn.click();
      await new Promise(r => setTimeout(r, 300));
    }
    // Submit login
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });

    // 5. Dashboard Page
    console.log('Capturing Dashboard Page...');
    await new Promise(r => setTimeout(r, 1500)); // allow charts and data to render
    await page.screenshot({ path: path.join(screenshotsDir, '04_dashboard.png'), fullPage: true });

    // 6. Add Reading Modal
    console.log('Capturing Add Reading Modal...');
    // Click Add reading
    const addBtns = await page.$$('button');
    for (const btn of addBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Add Reading')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(screenshotsDir, '05_add_reading_modal.png') });

    // Close modal by clicking Cancel
    const cancelBtns = await page.$$('button');
    for (const btn of cancelBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Cancel')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 500));

    // 7. Reading History Page
    console.log('Capturing Reading History Page...');
    await page.goto(`${baseUrl}/history`, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotsDir, '06_reading_history.png'), fullPage: true });

    // 8. Reports Page
    console.log('Capturing Reports Page...');
    await page.goto(`${baseUrl}/reports`, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotsDir, '07_reports_daily.png'), fullPage: true });

    // Click Month-to-date tab
    const tabs = await page.$$('button');
    for (const tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text && text.includes('Month-to-Date')) {
        await tab.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotsDir, '08_reports_month_to_date.png'), fullPage: true });

    // 9. Profile Page
    console.log('Capturing Profile Page...');
    await page.goto(`${baseUrl}/profile`, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(screenshotsDir, '09_profile_page.png') });

    console.log('All screenshots captured successfully!');
  } catch (err) {
    console.error('Screenshot capture failed:', err);
  } finally {
    await browser.close();
  }
}

capture();
