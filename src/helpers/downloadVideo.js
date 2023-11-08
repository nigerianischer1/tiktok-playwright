const { createWriteStream } = require('fs')
const https = require('https')

const downloadVideo = (url, dest) => {
  const file = createWriteStream(dest)

  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
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
      reject(err)
    })
  })


}

module.exports = downloadVideo
