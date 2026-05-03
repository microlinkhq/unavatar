'use strict'

const test = require('ava')
const cheerio = require('cheerio')

const { getAvatar } = require('../../../src/providers/pinterest')

const AVATAR_URL =
  'https://i.pinimg.com/280x280_RS/9a/44/f6/9a44f6b6bffba5e3bc1de97f92d346c1.jpg'

test('.getAvatar returns avatar URL from JSON-LD mainEntity.image.contentUrl', t => {
  const $ = cheerio.load(
    `<html><head>
      <script type="application/ld+json">
        {"@context":"https://schema.org/","@type":"ProfilePage","mainEntity":{"@type":"Person","image":{"@type":"ImageObject","contentUrl":"${AVATAR_URL}"}}}
      </script>
    </head><body></body></html>`
  )

  t.is(getAvatar($), AVATAR_URL)
})

test('.getAvatar returns undefined when JSON-LD is present but avatar path is missing', t => {
  const $ = cheerio.load(
    `<html><head>
      <script type="application/ld+json">
        {"@context":"https://schema.org/","@type":"ProfilePage","mainEntity":{"@type":"Person"}}
      </script>
    </head><body></body></html>`
  )

  t.is(getAvatar($), undefined)
})

test('.getAvatar returns undefined when Pinterest avatar data is missing', t => {
  const $ = cheerio.load('<html><head></head><body></body></html>')
  t.is(getAvatar($), undefined)
})
