'use strict'

const test = require('ava')
const cheerio = require('cheerio')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/paypal')

const avatarUrl =
  'https://pics.paypal.com/00/s/NjAwWDYwMFhKUEc/p/OTI1ZmUyNjMtMzgzNy00NTNkLWFlNjQtODRiZTg0YjNjOGRk/image_58.jpg'

test('paypal builds paypalme profile URL', t => {
  t.is(getAvatarUrl('kikobeats'), 'https://www.paypal.com/paypalme/kikobeats')
})

test('.getAvatar extracts profile photo from client-data payload', t => {
  const payload = JSON.stringify({
    recipientSlugDetails: {
      slugDetails: { userInfo: { profilePhotoUrl: avatarUrl } }
    }
  })
  const html = `
    <html>
      <body>
        <script type="application/json" id="client-data">${payload}</script>
      </body>
    </html>
  `

  const $ = cheerio.load(html)
  t.is(getAvatar($), avatarUrl)
})

test('.getAvatar returns undefined when client-data is missing', t => {
  const $ = cheerio.load('<html><body></body></html>')
  t.is(getAvatar($), undefined)
})
