'use strict'

const test = require('ava')
const cheerio = require('cheerio')

const { getAvatarUrl } = require('../../../src/providers/pinterest')

const AVATAR_URL =
  'https://i.pinimg.com/280x280_RS/9a/44/f6/9a44f6b6bffba5e3bc1de97f92d346c1.jpg'

test('.getAvatarUrl returns avatar URL from JSON-LD mainEntity.image.contentUrl', t => {
  const $ = cheerio.load(
    `<html><head>
      <script type="application/ld+json">
        {"@context":"https://schema.org/","@type":"ProfilePage","mainEntity":{"@type":"Person","image":{"@type":"ImageObject","contentUrl":"${AVATAR_URL}"}}}
      </script>
    </head><body></body></html>`
  )

  t.is(getAvatarUrl($), AVATAR_URL)
})

test('.getAvatarUrl returns undefined when JSON-LD is present but avatar path is missing', t => {
  const $ = cheerio.load(
    `<html><head>
      <script type="application/ld+json">
        {"@context":"https://schema.org/","@type":"ProfilePage","mainEntity":{"@type":"Person"}}
      </script>
    </head><body></body></html>`
  )

  t.is(getAvatarUrl($), undefined)
})

test('.getAvatarUrl returns undefined when Pinterest avatar data is missing', t => {
  const $ = cheerio.load('<html><head></head><body></body></html>')
  t.is(getAvatarUrl($), undefined)
})
