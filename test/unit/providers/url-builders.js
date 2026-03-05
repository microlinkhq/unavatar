'use strict'

const test = require('ava')

const { AVATAR_SIZE } = require('../../../src/constant')

const duckduckgo = require('../../../src/providers/duckduckgo')({})
const github = require('../../../src/providers/github')({ constants: { AVATAR_SIZE } })
const google = require('../../../src/providers/google')({})
const gravatar = require('../../../src/providers/gravatar')({ constants: { AVATAR_SIZE } })

test('duckduckgo builds favicon URL', t => {
  t.is(duckduckgo({ input: 'microlink.io' }), 'https://icons.duckduckgo.com/ip3/microlink.io.ico')
})

test('github appends configured avatar size', async t => {
  const url = await github({ input: 'kikobeats' })
  t.is(url, `https://github.com/kikobeats.png?size=${AVATAR_SIZE}`)
})

test('google builds favicon URL with fixed size', t => {
  t.is(
    google({ input: 'unavatar.io' }),
    'https://www.google.com/s2/favicons?domain_url=unavatar.io&sz=128'
  )
})

test('gravatar normalizes email and hashes it', t => {
  const url = gravatar({ input: '  SindreSorhus@gmail.com ' })
  t.true(url.startsWith('https://gravatar.com/avatar/'))
  t.true(url.includes(`size=${AVATAR_SIZE}`))
  t.true(url.includes('d=404'))
  t.true(url.includes('d36a92237c75c5337c17b60d90686bf9'))
})
