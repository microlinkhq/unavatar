'use strict'

const test = require('ava')
const cheerio = require('cheerio')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/cashapp')

const avatarUrl =
  'https://franklin-assets.s3.amazonaws.com/apps/imgs/oUP48hLvd7gBhMXVpGhBcF.jpeg'

const htmlWith = profile => `
  <html>
    <body>
      <script>
        var profile = ${JSON.stringify(profile)};
      </script>
    </body>
  </html>
`

test('cashapp builds cashtag profile URL', t => {
  t.is(getAvatarUrl('kikobeats'), 'https://cash.app/$kikobeats')
})

test('cashapp ignores a leading $ in the input', t => {
  t.is(getAvatarUrl('$kikobeats'), 'https://cash.app/$kikobeats')
})

test('.getAvatar extracts image_url from the profile payload', t => {
  const $ = cheerio.load(
    htmlWith({
      display_name: 'Brooke McKim',
      formatted_cashtag: '$ninja',
      avatar: { image_url: avatarUrl, initial: 'B', accent_color: '#FB60C4' }
    })
  )
  t.is(getAvatar($), avatarUrl)
})

test('.getAvatar returns undefined when the avatar has no image', t => {
  const $ = cheerio.load(
    htmlWith({
      display_name: 'Cameron Bowden',
      formatted_cashtag: '$Sykkuno',
      avatar: { initial: 'C', accent_color: '#FF4A4A' }
    })
  )
  t.is(getAvatar($), undefined)
})

test('.getAvatar returns undefined when the profile is missing', t => {
  const $ = cheerio.load('<html><body></body></html>')
  t.is(getAvatar($), undefined)
})
