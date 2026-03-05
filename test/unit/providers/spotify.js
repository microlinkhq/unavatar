'use strict'

const test = require('ava')

test('spotify provider derives URI from usernames and typed identifiers', t => {
  const createHtmlProvider = opts => opts
  const provider = require('../../../src/providers/spotify')({
    createHtmlProvider,
    getOgImage: () => 'og-image'
  })

  t.is(provider.url('iron_maiden_'), 'https://open.spotify.com/user/iron_maiden_')
  t.is(
    provider.url('artist:1vCWHaC5f2uS3yhpwWbIA6'),
    'https://open.spotify.com/artist/1vCWHaC5f2uS3yhpwWbIA6'
  )
  t.deepEqual(provider.htmlOpts(), { prerender: true })
})
