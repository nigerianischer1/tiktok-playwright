#!/usr/bin/env node

const TikTokPlaywright = require('./src/TikTokPlaywright')

if (require.main === module) {
  ;(async () => {
    try {
      const {user, ...options} = require('./src/cli')
      await new TikTokPlaywright().download(user, options)
    } catch (e) {
      console.error(e)
    }
  })()
} else {
  module.exports = TikTokPlaywright
}
