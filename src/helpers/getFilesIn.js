const fs = require('fs')
const util = require('util')
const readdir = util.promisify(fs.readdir)

const getFilesIn = async (path) => {
  const files =  await readdir(path)

  return files.reduce((filesMap, file) => {
    filesMap[file] = true
    return filesMap
  }, {})
}

module.exports = getFilesIn
