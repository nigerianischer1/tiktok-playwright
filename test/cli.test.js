const meow = require('meow')
jest.mock('meow')

describe('cli', () => {
  let moduleExports, cliOutput

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation()
    jest.spyOn(process, 'exit').mockImplementation()

    cliOutput = {
      input: [],
      showHelp: jest.fn(),
      flags: {
        quiet: false
      }
    }
  })

  describe('when a user is not specified', () => {
    beforeEach(() => {
      cliOutput.input = []

      meow.mockReturnValue(cliOutput)

      jest.isolateModules(() => {
        try {
          moduleExports = require('../src/cli')
        } catch (e) { /* ignore */
        }
      })
    })

    it('logs an error to the stderr', () => {
      expect(console.error).toBeCalledWith('Please specify a user.')
    })

    it('shows the help', () => {
      expect(meow.mock.results[0].value.showHelp).toBeCalled()
    })

    it('process exits with an exit code of 1', () => {
      expect(process.exit).toBeCalledWith(1)
    })
  })

  describe('when a user is specified', () => {

    beforeEach(() => {
      cliOutput.input = ['@user?lang=en']

      meow.mockReturnValue(cliOutput)

      jest.isolateModules(() => {
        moduleExports = require('../src/cli')
      })
    })

    it('returns the user', () => {
      expect(moduleExports).toMatchObject({user: 'user'})
    })
  })

  describe('when a download destination is specified', () => {
    beforeEach(() => {
      cliOutput.input = ['@user?lang=en']
      cliOutput.flags = {
        downloadDir: '/path/to/download'
      }

      meow.mockReturnValue(cliOutput)

      jest.isolateModules(() => {
        moduleExports = require('../src/cli')
      })
    })

    it('returns the specified download destination', () => {
      expect(moduleExports).toMatchObject({downloadDir: cliOutput.flags.downloadDir})
    })
  })

  describe('when a download destination is NOT specified', () => {
    beforeEach(() => {
      cliOutput.input = ['@user?lang=en']

      meow.mockReturnValue(cliOutput)

      jest.isolateModules(() => {
        moduleExports = require('../src/cli')
      })
    })

    it('returns a directory with the name of the user under the current directory', () => {
      expect(moduleExports).toMatchObject({downloadDir: './user'})
    })
  })

  describe('when quiet is specified', () => {
    beforeEach(() => {
      cliOutput.input = ['@user?lang=en']
      cliOutput.flags.quiet = true

      meow.mockReturnValue(cliOutput)

      jest.isolateModules(() => {
        moduleExports = require('../src/cli')
      })
    })

    it('returns true for quiet', () => {
      expect(moduleExports).toMatchObject({quiet: true})
    })
  })

  describe('when quiet is NOT specified', () => {
    beforeEach(() => {
      cliOutput.input = ['@user?lang=en']

      meow.mockReturnValue(cliOutput)

      jest.isolateModules(() => {
        moduleExports = require('../src/cli')
      })
    })

    it('returns false for quiet', () => {
      expect(moduleExports).toMatchObject({quiet: false})
    })
  })
})
