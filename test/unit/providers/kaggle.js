'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const createHtmlProviderFactory = require('../../../src/util/html-provider')
const { NOT_FOUND } = require('../../../src/util/html-provider')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/kaggle')

const PROFILE_URL = 'https://www.kaggle.com/jhoward'

const profileHtml = image =>
  '<html><head>' +
  '<meta property="og:type" content="profile" />' +
  `<meta name="twitter:image" content="${image}" />` +
  `<meta name="twitter:image:alt" content="${image}" />` +
  '</head></html>'

const siteHtml =
  '<html><head>' +
  '<meta property="og:image" content="https://www.kaggle.com/static/images/logos/kaggle-logo-opengraph.png" />' +
  '<meta property="twitter:image" content="https://www.kaggle.com/static/images/logos/kaggle-logo-opengraph-square.png" />' +
  '</head></html>'

const createKaggle = ({ html, statusCode = 200 }) => {
  const calls = []
  const { createHtmlProvider } = createHtmlProviderFactory({
    PROXY_TIMEOUT: 1000,
    getHTML: async (url, opts) => {
      calls.push(url)
      return { $: cheerio.load(html), statusCode, headers: {} }
    }
  })
  const kaggle = require('../../../src/providers/kaggle')({
    createHtmlProvider,
    NOT_FOUND
  })
  return { kaggle, calls }
}

test('.getAvatarUrl builds the kaggle profile URL from username', t => {
  t.is(getAvatarUrl('jhoward'), PROFILE_URL)
})

test('.getAvatar upgrades the thumbnail to the full size image', t => {
  const $ = cheerio.load(
    profileHtml(
      'https://storage.googleapis.com/kaggle-avatars/thumbnails/795521-gp.jpg'
    )
  )
  t.is(
    getAvatar({ $, NOT_FOUND }),
    'https://storage.googleapis.com/kaggle-avatars/images/795521-gp.jpg'
  )
})

test('.getAvatar treats the default avatar as a miss', t => {
  const $ = cheerio.load(
    profileHtml(
      'https://storage.googleapis.com/kaggle-avatars/thumbnails/default-thumb.png'
    )
  )
  t.is(getAvatar({ $, NOT_FOUND }), NOT_FOUND)
})

test('.getAvatar treats the kaggle site logo as a miss', t => {
  t.is(getAvatar({ $: cheerio.load(siteHtml), NOT_FOUND }), NOT_FOUND)
})

test('.getAvatar returns undefined when there is no image meta', t => {
  const $ = cheerio.load('<html><head></head></html>')
  t.is(getAvatar({ $, NOT_FOUND }), undefined)
})

test('provider resolves the full size avatar for a real profile', async t => {
  const { kaggle, calls } = createKaggle({
    html: profileHtml(
      'https://storage.googleapis.com/kaggle-avatars/thumbnails/3256.png'
    )
  })
  t.is(
    await kaggle('jhoward'),
    'https://storage.googleapis.com/kaggle-avatars/images/3256.png'
  )
  t.deepEqual(calls, [PROFILE_URL])
})

test('provider resolves undefined for a missing user', async t => {
  const { kaggle } = createKaggle({ html: siteHtml, statusCode: 404 })
  t.is(await kaggle('thisuserdoesnotexist-zz9q7x'), undefined)
})

test('provider resolves undefined for a user without a picture', async t => {
  const { kaggle } = createKaggle({
    html: profileHtml(
      'https://storage.googleapis.com/kaggle-avatars/thumbnails/default-thumb.png'
    )
  })
  t.is(await kaggle('johnsmith'), undefined)
})

test('provider resolves undefined for a non profile kaggle page', async t => {
  const { kaggle } = createKaggle({ html: siteHtml })
  t.is(await kaggle('datasets'), undefined)
})
