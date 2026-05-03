'use strict'

const test = require('ava')
const cheerio = require('cheerio')

test('onlyfans provider exposes expected URL and html opts', t => {
  const createHtmlProvider = opts => opts
  const provider = require('../../../src/providers/onlyfans')({
    createHtmlProvider
  })

  t.is(provider.url('amandaribas'), 'https://onlyfans.com/amandaribas')
  t.deepEqual(provider.htmlOpts(), {
    prerender: true,
    puppeteerOpts: {
      waitForSelector: '#app',
      abortTypes: ['other', 'image', 'font']
    }
  })
})

const { getAvatar } = require('../../../src/providers/onlyfans')

test('.getAvatar parses JSON-LD avatar URL', t => {
  const html = `
    <html>
      <head>
        <script type="application/ld+json">
          {"mainEntity":{"image":"https://cdn.example.com/of-avatar.jpg"}}
        </script>
      </head>
    </html>
  `
  const $ = cheerio.load(html)
  t.is(getAvatar($), 'https://cdn.example.com/of-avatar.jpg')
})

test('.getAvatar returns undefined when JSON-LD script is missing', t => {
  const $ = cheerio.load('<html><head></head></html>')
  t.is(getAvatar($), undefined)
})
