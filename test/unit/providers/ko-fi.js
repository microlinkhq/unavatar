'use strict'

const test = require('ava')
const cheerio = require('cheerio')

const { getAvatar } = require('../../../src/providers/ko-fi')

test('ko-fi provider exposes expected URL', t => {
  const createHtmlProvider = opts => opts
  const provider = require('../../../src/providers/ko-fi')({
    createHtmlProvider
  })

  t.is(provider.url('kikobeats'), 'https://ko-fi.com/kikobeats')
})

test('.getAvatar extracts profile picture src', t => {
  const html = `
    <html>
      <body>
        <img id="profilePicture" src="https://storage.ko-fi.com/cdn/useruploads/avatar.png" />
      </body>
    </html>
  `

  const $ = cheerio.load(html)
  t.is(getAvatar($), 'https://storage.ko-fi.com/cdn/useruploads/avatar.png')
})

test('.getAvatar returns undefined when profile picture is missing', t => {
  const html = '<html><body></body></html>'

  const $ = cheerio.load(html)
  t.is(getAvatar($), undefined)
})
