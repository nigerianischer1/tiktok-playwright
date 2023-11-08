const scrollToBottom = require('../../src/helpers/scrollToBottom')

describe('scrollToBottom', () => {
  let page

  beforeEach(() => {
    document.scrollingElement = {
      scrollBy: jest.fn()
    }

    page = {
      scrollMore: false,
      evaluate: function (pageFn, ...args) {
        if (args.length) return pageFn(...args)

        pageFn()
        this.scrollMore = !this.scrollMore
        return this.scrollMore
      },
      waitForTimeout: jest.fn()
    }
  })

  describe('when the scrollTop and window height is less than the scrollHeight', () => {
    beforeEach(async () => {
      await scrollToBottom(page)
    })

    it('scrolls the distance', () => {
      expect(document.scrollingElement.scrollBy).toBeCalledWith(0, 100)
    })

    it('waits for timeout', () => {
      expect(page.waitForTimeout).toBeCalledWith(400)
    })
  })
})
