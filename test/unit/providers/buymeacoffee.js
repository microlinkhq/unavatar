'use strict'

const test = require('ava')
const cheerio = require('cheerio')

const { getAvatarUrl } = require('../../../src/providers/buymeacoffee')

const avatarUrl =
  'https://cdn.buymeacoffee.com/uploads/profile_pictures/2019/04/abf02d8c433f9b9b36272b48e66ceba8.jpg'

test('buymeacoffee provider exposes expected URL', t => {
  const createHtmlProvider = opts => opts
  const provider = require('../../../src/providers/buymeacoffee')({
    createHtmlProvider
  })

  t.is(provider.url('kikobeats'), 'https://buymeacoffee.com/kikobeats')
})

test('.getAvatarUrl extracts creator avatar from data-page payload', t => {
  const html = `
    <html>
      <body>
        <div id="app" data-page='{"props":{"creator_data":{"data":{"dp":"${avatarUrl}"}}}}'></div>
      </body>
    </html>
  `

  const $ = cheerio.load(html)
  t.is(getAvatarUrl($), avatarUrl)
})

test('.getAvatarUrl falls back to regex extraction when data-page is not valid JSON', t => {
  const escapedAvatarUrl = avatarUrl.replace(/\//g, '\\/')
  const html = `
    <html>
      <body>
        <div id="app" data-page='noise "dp":"${escapedAvatarUrl}"'></div>
      </body>
    </html>
  `

  const $ = cheerio.load(html)
  t.is(getAvatarUrl($), avatarUrl)
})

test('.getAvatarUrl returns undefined when data-page payload is missing', t => {
  const $ = cheerio.load('<html><body></body></html>')
  t.is(getAvatarUrl($), undefined)
})
