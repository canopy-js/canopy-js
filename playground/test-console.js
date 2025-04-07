const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:8080', { waitUntil: 'load' });

  const consoleEl = await page.$('#console');
  if (!consoleEl) {
    console.error('❌ No element with id="console" found');
    process.exit(1);
  }

  const hasErrorClass = await consoleEl.evaluate(el =>
    el.classList.contains('error')
  );

  if (hasErrorClass) {
    console.error('❌ #console has class="error"');
    process.exit(1);
  }

  console.log('✅ #console exists and has no error class');
  await browser.close();
})();
