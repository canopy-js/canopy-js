const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5000', { waitUntil: 'load' });

    const consoleEl = await page.$('#console');
    if (!consoleEl) throw new Error('Missing #console');

    const hasErrorClass = await consoleEl.evaluate(el =>
      el.classList.contains('error')
    );
    if (hasErrorClass) throw new Error('#console has class="error"');

    const header = await page.$('h1.canopy-header');
    if (!header) throw new Error('Missing h1.canopy-header');

    const text = await header.textContent();
    if (text.trim() !== 'Playground') throw new Error(`Unexpected header text: "${text.trim()}"`);

    console.log('✅ DOM OK');
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
