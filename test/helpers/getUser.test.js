const getUser = require('../../src/helpers/getUser')

describe('getUser', () => {
  describe('when the user is NOT prefixed with @ AND does not have a query string', () => {
    it('returns the user', () => {
      expect(getUser('tiktok')).toEqual('tiktok')
    })
  })

  describe('when the user is prefixed with @', () => {
    it('returns the user', () => {
      expect(getUser('@tiktok')).toEqual('tiktok')
    })
  })

  describe('when the user has a query string', () => {
    it('returns the user', () => {
      expect(getUser('tiktok?lang=en')).toEqual('tiktok')
    })
  })

  describe('when the user is prefixed with an @ and has a query string', () => {
    it('returns the user', () => {
      expect(getUser('@tiktok?lang=en')).toEqual('tiktok')
    })
  })
})
