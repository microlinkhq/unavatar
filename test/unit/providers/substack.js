'use strict'

const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const sinon = require('sinon')
const { default: test } = require('ava')

const createHtmlProviderFactory = require('../../../src/util/html-provider')
const substackFactory = require('../../../src/providers/substack')

const { getAvatar, getAvatarUrl, parseInput } = substackFactory

const createSubstack = () => {
  const getHTML = sinon.stub().resolves({
    $: cheerio.load(
      '<script type="application/ld+json">{"publisher":{"logo":{"url":"https://substackcdn.com/logo.png"}}}</script>'
    ),
    statusCode: 200
  })
  const { createHtmlProvider } = createHtmlProviderFactory({
    PROXY_TIMEOUT: 8000,
    getHTML
  })
  return { substack: substackFactory({ createHtmlProvider }), getHTML }
}

const HOST_ESCAPES = [
  'attacker.example\\',
  '127.0.0.1:8443\\',
  '127.0.0.1:8443/',
  'evil.com#',
  'evil.com?',
  'user@evil.com',
  'metadata.google.internal\\',
  '[::1]:80\\',
  'bankless.evil.com',
  ' bankless',
  'bankless ',
  '-bankless',
  'bankless-',
  'a'.repeat(64),
  ''
]

test('.parseInput accepts a publication subdomain and lowercases it', t => {
  t.is(parseInput('a'), 'a')
  t.is(parseInput('a1'), 'a1')
  t.is(parseInput('bankless'), 'bankless')
  t.is(parseInput('Bankless'), 'bankless')
  t.is(parseInput('failing-with-data'), 'failing-with-data')
  t.is(parseInput('a'.repeat(63)), 'a'.repeat(63))
})

test('.parseInput refuses anything that would move the request off substack.com', t => {
  for (const input of HOST_ESCAPES) {
    t.is(parseInput(input), undefined, JSON.stringify(input))
  }
  t.is(parseInput(undefined), undefined)
  t.is(parseInput(42), undefined)
})

test('every accepted input builds a URL whose host stays on substack.com', t => {
  for (const input of ['bankless', 'Failing-With-Data', 'a1']) {
    const { hostname } = new URL(getAvatarUrl(parseInput(input)))
    t.true(hostname.endsWith('.substack.com'), hostname)
  }
})

test('a host escape never reaches the page fetch', async t => {
  const { substack, getHTML } = createSubstack()
  for (const input of HOST_ESCAPES) {
    t.is(await substack(input), undefined, JSON.stringify(input))
  }
  t.false(getHTML.called)
})

test('a publication is fetched from its substack.com subdomain', async t => {
  const { substack, getHTML } = createSubstack()
  t.is(await substack('Bankless'), 'https://substackcdn.com/logo.png')
  t.is(getHTML.firstCall.args[0], 'https://bankless.substack.com')
})

test('.getAvatar returns publisher logo from jsonld', t => {
  const html = `
    <html>
      <head>
        <script type="application/ld+json">
          {"publisher":{"logo":{"url":"https://cdn.example.com/logo.jpg"}}}
        </script>
        <meta property="og:image" content="https://cdn.example.com/og.jpg" />
      </head>
    </html>
  `

  const $ = cheerio.load(html)
  t.is(getAvatar($), 'https://cdn.example.com/logo.jpg')
})

test('.getAvatar falls back to highest resolution picture srcset when jsonld logo is missing', t => {
  const html = `
    <html>
      <body>
        <picture class="pencraft pc-display-contents pc-reset">
          <source
            type="image/webp"
            srcset="https://substackcdn.com/image/fetch/w_88/avatar.webp 88w, https://substackcdn.com/image/fetch/w_176/avatar.webp 176w, https://substackcdn.com/image/fetch/w_264/avatar.webp 264w"
          />
          <img
            src="https://substackcdn.com/image/fetch/w_88/avatar.png"
            srcset="https://substackcdn.com/image/fetch/w_88/avatar.png 88w, https://substackcdn.com/image/fetch/w_176/avatar.png 176w, https://substackcdn.com/image/fetch/w_264/avatar.png 264w"
          />
        </picture>
      </body>
    </html>
  `

  const $ = cheerio.load(html)
  t.is(getAvatar($), 'https://substackcdn.com/image/fetch/w_264/avatar.png')
})

test('.getAvatar falls back to picture img src when srcset is missing', t => {
  const html = `
    <html>
      <body>
        <picture>
          <img src="https://substackcdn.com/image/fetch/w_88/avatar.png" />
        </picture>
      </body>
    </html>
  `

  const $ = cheerio.load(html)
  t.is(getAvatar($), 'https://substackcdn.com/image/fetch/w_88/avatar.png')
})

test('.getAvatar parses srcset URLs containing commas', t => {
  const html = `
    <html>
      <body>
        <picture>
          <img
            src="https://substackcdn.com/image/fetch/w_88/avatar.png"
            srcset="https://substackcdn.com/image/fetch/$s_!b-El!,w_88,h_88,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fimg.png 88w, https://substackcdn.com/image/fetch/$s_!b-El!,w_264,h_264,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fimg.png 264w"
          />
        </picture>
      </body>
    </html>
  `

  const $ = cheerio.load(html)
  t.is(
    getAvatar($),
    'https://substackcdn.com/image/fetch/$s_!b-El!,w_264,h_264,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fimg.png'
  )
})

test('.getAvatar resolves expected avatar from real substack datacenter fixture', t => {
  const html = fs.readFileSync(
    path.join(__dirname, 'substack-datacenter.html'),
    'utf8'
  )
  const $ = cheerio.load(html)

  t.is(
    getAvatar($),
    'https://substackcdn.com/image/fetch/$s_!b-El!,w_264,h_264,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F65139ad0-319a-42ca-9a37-c024fae1c727_1024x1024.png'
  )
})

test('.getUrl validates the input it builds a URL from', t => {
  const { substack } = createSubstack()
  t.is(substack.getUrl('Bankless'), 'https://bankless.substack.com')
  for (const input of HOST_ESCAPES) {
    t.is(substack.getUrl(input), undefined, JSON.stringify(input))
  }
})
