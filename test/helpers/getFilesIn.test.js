const getFilesIn = require('../../src/helpers/getFilesIn')

const fs = require('fs')

jest.mock('fs')
jest.mock('util', () => ({
  promisify: jest.fn().mockImplementation((fn) => fn)
}))

describe('getFilesIn', () => {
  describe('when there are no files in the path', () => {
    beforeEach(() => {
      jest.spyOn(fs, 'readdir').mockReturnValue([])
    })

    it('returns an empty object', async () => {
      expect(await getFilesIn('./')).toEqual({})
    })
  })

  describe('when there are files in the path', () => {
    beforeEach(() => {
      jest.spyOn(fs, 'readdir').mockReturnValue([
        'file1',
        'file2',
        'file3'
      ])
    })

    it('returns an object', async () => {
      expect(await getFilesIn('./')).toEqual({
        file1: true,
        file2: true,
        file3: true
      })
    })
  })
})
