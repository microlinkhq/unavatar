'use strict'

const test = require('ava')
const cheerio = require('cheerio')

test('onlyfans provider exposes expected URL and html opts', t => {
  const createHtmlProvider = opts => opts
  const provider = require('../../../src/providers/onlyfans')({ createHtmlProvider })

  t.is(provider.url('amandaribas'), 'https://onlyfans.com/amandaribas')
  t.deepEqual(provider.htmlOpts(), {
    prerender: true,
    puppeteerOpts: { waitUntil: 'networkidle2', abortTypes: ['other', 'image', 'font'] }
  })
})

test('onlyfans getter parses JSON-LD avatar URL and handles empty script payload', t => {
  const createHtmlProvider = opts => opts
  const provider = require('../../../src/providers/onlyfans')({ createHtmlProvider })

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
  t.is(provider.getter($), 'https://cdn.example.com/of-avatar.jpg')

  const empty = cheerio.load('<html><head></head></html>')
  t.is(provider.getter(empty), undefined)
})
