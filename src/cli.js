const meow = require('meow')
const getUser = require('./helpers/getUser')

const cli = meow(`
	Usage
	  $ tiktok-playwright <user>

	Options
    --version            Show version number             
    --downloadDir, -d    Download destination            [default: "./<user>"]
    --redownload,  -r    Re-downloads existing files     [default: false]
    --quiet,       -q    Disables message output         [default: false]
    --help               Show help                       

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

