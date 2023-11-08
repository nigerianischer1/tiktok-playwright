const scrollToBottom = async (page, catchaSolver, distance = 1000, delay = 200) => {
  while (await page.evaluate(() => document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight)) {
    await page.evaluate((y) => {
      document.scrollingElement.scrollBy(0, y)
    }, distance)

    await page.waitForTimeout(delay)
  }
}

module.exports = scrollToBottom
