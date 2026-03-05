'use strict'

const unavatar = require('@unavatar/core')()

async function main () {
  // Auto-resolve: detects input type (email, domain, or username)
  // and tries matching providers automatically
  const fromEmail = await unavatar('hello@microlink.io')
  console.log('email →', fromEmail.data)

  const fromDomain = await unavatar('reddit.com')
  console.log('domain →', fromDomain.data)

  // Resolve from a specific provider
  const fromGithub = await unavatar.github('kikobeats')
  console.log('github →', fromGithub.data)

  const fromGravatar = await unavatar.gravatar('hello@microlink.io')
  console.log('gravatar →', fromGravatar.data)

  // Every result has { type, data, provider }
  // - type: 'url' or 'buffer'
  // - data: the avatar URL (or data URI)
  // - provider: which provider resolved it
  const result = await unavatar.x('kikobeats')
  console.log('x →', result)
}

main().catch(console.error)
