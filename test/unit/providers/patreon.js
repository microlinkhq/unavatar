'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const { getAvatar } = require('../../../src/providers/patreon')

test('.getAvatar extracts contentUrl from JSON-LD (old layout)', t => {
  const html = `
    <html>
      <head>
        <script type="application/ld+json">{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          "mainEntity": {
            "@type": "Person",
            "name": "Jaime",
            "image": {
              "@type": "ImageObject",
              "contentUrl": "https://c10.patreonusercontent.com/4/patreon-media/p/campaign/4790824/avatar/eyJ3Ijo2MjB9/1.jpeg?token-hash=abc123",
              "thumbnailUrl": "https://c10.patreonusercontent.com/4/patreon-media/p/campaign/4790824/avatar/eyJoIjozNjB9/1.jpeg?token-hash=def456"
            }
          }
        }</script>
      </head>
    </html>
  `

  const $ = cheerio.load(html)
  t.is(
    getAvatar($),
    'https://c10.patreonusercontent.com/4/patreon-media/p/campaign/4790824/avatar/eyJ3Ijo2MjB9/1.jpeg?token-hash=abc123'
  )
})

test('.getAvatar prefers JSON-LD over RSC when both exist', t => {
  const html = `
    <html>
      <head>
        <script type="application/ld+json">{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          "mainEntity": {
            "@type": "Person",
            "image": {
              "@type": "ImageObject",
              "contentUrl": "https://c10.patreonusercontent.com/4/patreon-media/p/campaign/123/avatar/eyJ3Ijo2MjB9/42.png?token-hash=jsonld"
            }
          }
        }</script>
      </head>
      <body>
        <script>self.__next_f.push([1,"avatarPhotoImageUrls\\":\{\\"original\\":\\"https://c10.patreonusercontent.com/4/patreon-media/p/campaign/123/avatar/eyJxIjoxMDB9/42.png?token-hash=rsc\\"}"])</script>
      </body>
    </html>
  `

  const $ = cheerio.load(html)
  t.is(
    getAvatar($),
    'https://c10.patreonusercontent.com/4/patreon-media/p/campaign/123/avatar/eyJ3Ijo2MjB9/42.png?token-hash=jsonld'
  )
})

test('.getAvatar extracts original quality avatar from RSC payload (Creator World layout)', t => {
  const html = `
    <html>
      <head>
        <script type="application/ld+json"></script>
      </head>
      <body>
        <script>self.__next_f.push([1,"avatarPhotoImageUrls\\":\{\\"original\\":\\"https://c10.patreonusercontent.com/4/patreon-media/p/campaign/6934869/hash/eyJxIjoxMDB9/42.png?token-hash=orig\\u0026token-time=123\\",\\"default\\":\\"https://c10.patreonusercontent.com/4/patreon-media/p/campaign/6934869/hash/eyJ3Ijo2MjB9/42.png?token-hash=def620\\u0026token-time=123\\"}"])</script>
      </body>
    </html>
  `

  const $ = cheerio.load(html)
  t.is(
    getAvatar($),
    'https://c10.patreonusercontent.com/4/patreon-media/p/campaign/6934869/hash/eyJxIjoxMDB9/42.png?token-hash=orig&token-time=123'
  )
})

test('.getAvatar returns undefined when page has no avatar signals', t => {
  const html = '<html><head></head><body></body></html>'

  const $ = cheerio.load(html)
  t.is(getAvatar($), undefined)
})
