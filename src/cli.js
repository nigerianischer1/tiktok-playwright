const meow = require('meow')
const getUser = require('./helpers/getUser')

const cli = meow(`
	Usage
	  $ tiktok-playwright <user>

	Options
	  --downloadDir, -d  Download destination
	  --redownload,  -r  Re-downloads existing files
	  --quiet,       -q  Disables message output

	Examples
	  $ tiktok-playwright user -d /path/to/download
`, {
  flags: {
    downloadDir: {
      type: 'string',
      alias: 'd'
    },
    redownload: {
      type: 'boolean',
      alias: 'r',
      default: false
    },
    quiet: {
      type: 'boolean',
      alias: 'q',
      default: false
    }
  }
})

if (!cli.input.length) {
  console.error('Please specify a user.')
  cli.showHelp()
  process.exit(1)
}

let {input: [user], flags: {downloadDir, redownload, quiet}} = cli

user = getUser(user)

downloadDir = downloadDir
  ? downloadDir
  : `./${user}`

module.exports = {
  user,
  downloadDir,
  redownload,
  quiet,
}

