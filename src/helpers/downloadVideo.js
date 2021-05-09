const {createWriteStream, unlink} = require('fs')
const https = require('https')

const downloadVideo = (url, dest, cookieString) => {
  const file = createWriteStream(dest)

  return new Promise((resolve, reject) => {
    https.get(url, {
        headers: {
          Cookie: cookieString,
          Referer: 'https://www.tiktok.com/'
        }
      }, (response) => {
        file.on('finish', () => {
          file.close()
          resolve()
        })

        response.pipe(file)
      }
    ).on('error', (err) => {
      unlink(dest)
      reject(err)
    })
  })


}

module.exports = downloadVideo
