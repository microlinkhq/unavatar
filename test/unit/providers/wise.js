'use strict'

const test = require('ava')
const cheerio = require('cheerio')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/wise')

const avatarUrl =
  'https://tw-avatar.s3.eu-central-1.amazonaws.com/1503ea22-1e33-495c-990c-1bc4fa6cd255'

test('wise builds wisetag profile URL', t => {
  t.is(getAvatarUrl('josev2264'), 'https://wise.com/pay/me/josev2264')
})

test('.getAvatar extracts avatar from __NEXT_DATA__ payload', t => {
  const payload = JSON.stringify({
    props: {
      pageProps: {
        match: { display: { avatar: { type: 'THUMBNAIL', value: avatarUrl } } }
      }
    }
  })
  const html = `
    <html>
      <body>
        <script type="application/json" id="__NEXT_DATA__">${payload}</script>
      </body>
    </html>
  `

  const $ = cheerio.load(html)
  t.is(getAvatar($), avatarUrl)
})

test('.getAvatar returns undefined when __NEXT_DATA__ is missing', t => {
  const $ = cheerio.load('<html><body></body></html>')
  t.is(getAvatar($), undefined)
})
