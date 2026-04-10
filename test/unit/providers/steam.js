'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const getOgImage = require('../../../src/util/get-og-image')

const { getAvatarUrl } = require('../../../src/providers/steam')

test('.getAvatarUrl defaults to id path', t => {
  t.is(getAvatarUrl('Kikobeats'), 'https://steamcommunity.com/id/Kikobeats')
})

test('.getAvatarUrl supports profiles path', t => {
  t.is(
    getAvatarUrl('profiles:76561197976050016'),
    'https://steamcommunity.com/profiles/76561197976050016'
  )
})

test('.getAvatarUrl supports groups path', t => {
  t.is(
    getAvatarUrl('groups:microlink'),
    'https://steamcommunity.com/groups/microlink'
  )
})

test('.getAvatarUrl throws for unsupported type', t => {
  const error = t.throws(() => getAvatarUrl('clan:value'))
  t.is(error.message, 'Unsupported Steam type: clan')
})

test('.getter extracts og:image from steam html markup', t => {
  const html = `
    <html>
      <head>
        <meta property="og:image" content="https://avatars.fastly.steamstatic.com/b61907a035125c3fe28f8e55f4523d6b8fb82bdd_full.jpg" />
      </head>
    </html>
  `
  const $ = cheerio.load(html)

  const createHtmlProvider = opts => opts

  const steam = require('../../../src/providers/steam')({
    createHtmlProvider,
    getOgImage
  })

  t.is(
    steam.getter($),
    'https://avatars.fastly.steamstatic.com/b61907a035125c3fe28f8e55f4523d6b8fb82bdd_full.jpg'
  )
})

test('.getter extracts og:image from steam group html markup', t => {
  const html = `
    <html>
      <head>
        <meta property="og:image" content="https://avatars.fastly.steamstatic.com/34c730c9c7dac891ffa089ab7e0b7ed333235700_full.jpg" />
      </head>
    </html>
  `
  const $ = cheerio.load(html)

  const createHtmlProvider = opts => opts

  const steam = require('../../../src/providers/steam')({
    createHtmlProvider,
    getOgImage
  })

  t.is(
    steam.getter($),
    'https://avatars.fastly.steamstatic.com/34c730c9c7dac891ffa089ab7e0b7ed333235700_full.jpg'
  )
})
