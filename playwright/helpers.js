async function scrollElementToViewport(page, selector, offsetPercentage = 0.20) {
  while (true) {
    await page.locator(selector).evaluate((el, offset) => {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight * offset,
        behavior: 'smooth'
      });
    }, offsetPercentage);

    const isPositioned = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      const expectedPosition = window.innerHeight * 0.20;
      const diff = Math.abs(rect.top - expectedPosition);
      return diff < 10;
    }, selector);

    if (isPositioned) {
      break;
    } else {
    }
  }
}

module.exports = {
  scrollElementToViewport
};