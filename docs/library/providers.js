'use strict'

const unavatar = require('@unavatar/core')()

async function main () {
  // List all available providers
  console.log('providers:', Object.keys(unavatar.providers))

  // Providers grouped by input type, as tiers: the next tier is only tried
  // once every provider in the one before it has failed
  console.log('by email:', unavatar.providersBy.email.flat())
  console.log('by username:', unavatar.providersBy.username.flat())
  console.log('by domain:', unavatar.providersBy.domain.flat())

  // Detect the input type of a string
  console.log(unavatar.getInputType('kikobeats')) // 'username'
  console.log(unavatar.getInputType('hello@microlink.io')) // 'email'
  console.log(unavatar.getInputType('reddit.com')) // 'domain'

  // Try multiple providers for the same username
  const username = 'kikobeats'
  const providers = ['github', 'x', 'telegram']

  for (const name of providers) {
    try {
      const result = await unavatar[name](username)
      console.log(`${name} → ${result.data}`)
    } catch (error) {
      console.log(`${name} → failed: ${error.message}`)
    }
  }
}

main().catch(console.error)
