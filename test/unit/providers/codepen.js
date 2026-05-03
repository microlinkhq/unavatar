'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const getOgImage = require('../../../src/util/get-og-image')

const { getAvatarUrl } = require('../../../src/providers/codepen')

test('.getAvatarUrl builds a CodePen profile URL', t => {
  t.is(getAvatarUrl('tomhermans'), 'https://codepen.io/tomhermans')
})

test('.getter extracts og:image from codepen fixture markup', t => {
  const avatarUrl =
    'https://assets.codepen.io/11287/internal/avatars/users/default.png?fit=crop&format=auto&height=512&version=0&width=512'
  const html = `
    <html>
      <head>
        <meta property="og:image" content="${avatarUrl}" />
      </head>
    </html>
  `
  const $ = cheerio.load(html)

  const createHtmlProvider = opts => opts

  const codepen = require('../../../src/providers/codepen')({
    createHtmlProvider,
    getOgImage
  })

  t.is(codepen.getter($), avatarUrl)
})
