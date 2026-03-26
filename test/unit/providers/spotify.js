'use strict'

const test = require('ava')

const { getAvatarUrl } = require('../../../src/providers/spotify')

test('.getAvatarUrl defaults to user profile path', t => {
  t.is(
    getAvatarUrl('iron_maiden_'),
    'https://open.spotify.com/user/iron_maiden_'
  )
})

test('.getAvatarUrl with explicit artist type', t => {
  t.is(
    getAvatarUrl('artist:1vCWHaC5f2uS3yhpwWbIA6'),
    'https://open.spotify.com/artist/1vCWHaC5f2uS3yhpwWbIA6'
  )
})

test('.getAvatarUrl with explicit playlist type', t => {
  t.is(
    getAvatarUrl('playlist:37i9dQZF1DXcBWIGoYBM5M'),
    'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M'
  )
})
