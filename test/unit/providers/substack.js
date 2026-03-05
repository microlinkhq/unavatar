'use strict'

const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const test = require('ava')

const { getAvatarUrl } = require('../../../src/providers/substack')

test('.getAvatarUrl returns publisher logo from jsonld', t => {
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
  t.is(getAvatarUrl($), 'https://cdn.example.com/logo.jpg')
})

test('.getAvatarUrl falls back to highest resolution picture srcset when jsonld logo is missing', t => {
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
  t.is(getAvatarUrl($), 'https://substackcdn.com/image/fetch/w_264/avatar.png')
})

test('.getAvatarUrl falls back to picture img src when srcset is missing', t => {
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
  t.is(getAvatarUrl($), 'https://substackcdn.com/image/fetch/w_88/avatar.png')
})

test('.getAvatarUrl parses srcset URLs containing commas', t => {
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
    getAvatarUrl($),
    'https://substackcdn.com/image/fetch/$s_!b-El!,w_264,h_264,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fimg.png'
  )
})

test('.getAvatarUrl resolves expected avatar from real substack datacenter fixture', t => {
  const html = fs.readFileSync(path.join(__dirname, 'substack-datacenter.html'), 'utf8')
  const $ = cheerio.load(html)

  t.is(
    getAvatarUrl($),
    'https://substackcdn.com/image/fetch/$s_!b-El!,w_264,h_264,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F65139ad0-319a-42ca-9a37-c024fae1c727_1024x1024.png'
  )
})
