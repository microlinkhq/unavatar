'use strict'

const test = require('ava')
const cheerio = require('cheerio')

const { getAvatarUrl } = require('../../../src/providers/ko-fi')

test('ko-fi provider exposes expected URL', t => {
  const createHtmlProvider = opts => opts
  const provider = require('../../../src/providers/ko-fi')({
    createHtmlProvider
  })

  t.is(provider.url('kikobeats'), 'https://ko-fi.com/kikobeats')
})

test('.getAvatarUrl extracts profile picture src', t => {
  const html = `
    <html>
      <body>
        <img id="profilePicture" src="https://storage.ko-fi.com/cdn/useruploads/avatar.png" />
      </body>
    </html>
  `

  const $ = cheerio.load(html)
  t.is(getAvatarUrl($), 'https://storage.ko-fi.com/cdn/useruploads/avatar.png')
})

test('.getAvatarUrl returns undefined when profile picture is missing', t => {
  const html = '<html><body></body></html>'

  const $ = cheerio.load(html)
  t.is(getAvatarUrl($), undefined)
})
