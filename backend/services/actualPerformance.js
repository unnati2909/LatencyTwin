const { chromium } = require("playwright");

async function measureActualPerformance(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const start = Date.now();
  await page.goto(url, { waitUntil: "load", timeout: 30000 });
  const loadTime = Date.now() - start;

  const timing = await page.evaluate(() => {
    const t = performance.timing;
    return {
      domContentLoaded:
        t.domContentLoadedEventEnd - t.navigationStart,
      loadEvent: t.loadEventEnd - t.navigationStart,
    };
  });

  await browser.close();

  return {
    loadTime,
    domContentLoaded: timing.domContentLoaded,
    loadEvent: timing.loadEvent,
  };
}

module.exports = { measureActualPerformance };
