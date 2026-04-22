'use strict'

const unavatar = require('@unavatar/core')()

async function main () {
  // Explicit input type resolution
  const fromEmail = await unavatar.email('hello@microlink.io')
  console.log('email →', fromEmail.data)

  const fromDomain = await unavatar.domain('reddit.com')
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
