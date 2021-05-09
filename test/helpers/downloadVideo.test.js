const fs = require('fs')
const https = require('https')

const downloadVideo = require('../../src/helpers/downloadVideo')

jest.mock('fs')
jest.mock('https')

describe('downloadVideo', () => {
  let params
  let invokeErrorListener, invokeFinishListener
  let downloadVideoPromise

  beforeEach(() => {
    fs.createWriteStream.mockReturnValue({
      on: (_, finishListener) => {
        invokeFinishListener = finishListener
      },
      close: jest.fn()
    })

    https.get.mockReturnValue({
      on: (_, errorListener) => {
        invokeErrorListener = errorListener
      }
    })

    params = {
      url: 'http://www.tiktok.com/@test',
      dest: '',
      cookieString: '',
      cb: jest.fn()
    }

    downloadVideoPromise = downloadVideo(...Object.values(params))
    downloadVideoPromise.catch(() => {})
  })

  it('creates a write stream', () => {
    expect(fs.createWriteStream).toBeCalled()
  })

  it('makes a GET request to the url', () => {
    expect(https.get).toBeCalledWith(params.url, {
      headers: {
        Cookie: params.cookieString,
        Referer: 'https://www.tiktok.com/'
      }
    }, expect.any(Function))
  })

  describe('when the get response callback is invoked', () => {
    const pipe = jest.fn()

    beforeEach(() => {
      const onResponse = https.get.mock.calls[0][2]
      onResponse({pipe})
    })

    it('pipes the response to the file', () => {
      expect(pipe).toBeCalledWith(fs.createWriteStream.mock.results[0].value)
    })

    describe('when the finish event is emitted by the file', () => {
      beforeEach(() => {
        invokeFinishListener()
      })

      it('closes the file', () => {
        const file = fs.createWriteStream.mock.results[0].value
        expect(file.close).toBeCalled()
      })

      it('resolves the promise', () => {
        expect(downloadVideoPromise).resolves.toBeUndefined()
      })
    })
  })

  describe('when the error event is emitted by the get', () => {
    beforeEach(() => {
      invokeErrorListener('error')
    })

    it('unlinks the file', () => {
      expect(fs.unlink).toBeCalledWith(params.dest)
    })

    it('rejects the promise', () => {
      expect(downloadVideoPromise).rejects.toEqual('error')
    })


  })
})
