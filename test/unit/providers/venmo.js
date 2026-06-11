'use strict'

const test = require('ava')
const cheerio = require('cheerio')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/venmo')

const avatarUrl =
  'https://pics-v3.venmo.com/c88f13ab-d613-4a35-ac40-6156ae8dc2b3?width=460&height=460&version=1'

const htmlWith = user => `
  <html>
    <body>
      <script type="application/json" id="__NEXT_DATA__">${JSON.stringify({
        props: { pageProps: { user } }
      })}</script>
    </body>
  </html>
`

test('venmo builds the profile URL', t => {
  t.is(
    getAvatarUrl('Jessica-Lee-77'),
    'https://account.venmo.com/u/Jessica-Lee-77'
  )
})

test('.getAvatar extracts profilePictureUrl from __NEXT_DATA__ payload', t => {
  const $ = cheerio.load(
    htmlWith({ displayName: 'Jessica Lee', profilePictureUrl: avatarUrl })
  )
  t.is(getAvatar($), avatarUrl)
})

test('.getAvatar returns empty when the user has no picture', t => {
  const $ = cheerio.load(
    htmlWith({ displayName: 'Jacob Wheeler', profilePictureUrl: '' })
  )
  t.is(getAvatar($), '')
})

test('.getAvatar returns undefined when __NEXT_DATA__ is missing', t => {
  const $ = cheerio.load('<html><body></body></html>')
  t.is(getAvatar($), undefined)
})
