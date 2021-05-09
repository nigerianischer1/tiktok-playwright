const extractVideoUrlAndFilename = (url, contentType) => {
  const videoFormat = contentType.split('/')[1]
  const videoUrl = new URL(url)

  const pathname = videoUrl.pathname.slice(0, -1) // strip trailing slash
  const lastPathSegment = pathname.substring(pathname.lastIndexOf('/') + 1)
  const filename = `${lastPathSegment}.${videoFormat}`

  return {
    videoUrl: videoUrl.href,
    filename
  }
}

module.exports = extractVideoUrlAndFilename



