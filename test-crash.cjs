const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE CONSOLE ERROR:', msg.text());
  });
  await page.goto('http://localhost:5174/login');
  
  // Need to login first
  await page.waitForSelector('input[type="text"]');
  await page.type('input[type="text"]', 't@t.com');
  await page.type('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation();
  
  // Go to test
  await page.goto('http://localhost:5174/full-test');
  
  // Wait for it to load
  await page.waitForSelector('text=ข้อสอบ');
  
  // Jump to last question
  const dots = await page.$$('button[title*="ข้อ 100"]');
  if (dots.length > 0) {
    await dots[0].click();
  } else {
    // If we can't find title, just get the last button in the navigation grid
    const navButtons = await page.$$('div[style*="overflow-x: auto"] button');
    if (navButtons.length > 0) {
      await navButtons[navButtons.length - 1].click();
    }
  }
  
  // Click submit
  const submitBtn = await page.waitForSelector('button:has-text("ส่งคำตอบ")');
  await submitBtn.click();
  
  // Click confirm
  const confirmBtn = await page.waitForSelector('button:has-text("ยืนยันส่งข้อสอบ")');
  await confirmBtn.click();
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));
  console.log("Done");
  await browser.close();
})();
