'use strict'

const cheerio = require('cheerio')
const path = require('path')
const { default: test } = require('ava')
const fs = require('fs')

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

const readFixture = name =>
  fs.readFileSync(path.join(__dirname, `kaggle-${name}.html`), 'utf8')

const CHALLENGED_USER_AGENT =
  'Better Uptime Bot Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'

const createKaggleChallengingAgent = ({ respond }) => {
  const userAgents = []
  const { createHtmlProvider } = createHtmlProviderFactory({
    PROXY_TIMEOUT: 1000,
    userAgent: () => CHALLENGED_USER_AGENT,
    getHTML: async (url, opts) => {
      const userAgent = opts.headers['user-agent']
      userAgents.push(userAgent)
      const { html, statusCode } =
        userAgent === CHALLENGED_USER_AGENT
          ? { html: readFixture('challenge'), statusCode: 200 }
          : respond(url)
      return { $: cheerio.load(html), statusCode, headers: {} }
    }
  })
  const kaggle = require('../../../src/providers/kaggle')({
    createHtmlProvider,
    NOT_FOUND
  })
  return { kaggle, userAgents }
}

test('provider resolves undefined for a missing user even when the rotated agent is challenged', async t => {
  const { kaggle, userAgents } = createKaggleChallengingAgent({
    respond: () => ({ html: readFixture('not-found'), statusCode: 404 })
  })
  t.is(await kaggle('zzqxnope9917'), undefined)
  t.is(userAgents.length, 1)
  t.not(userAgents[0], CHALLENGED_USER_AGENT)
})

test('provider resolves a real profile even when the rotated agent is challenged', async t => {
  const { kaggle } = createKaggleChallengingAgent({
    respond: () => ({
      html: profileHtml(
        'https://storage.googleapis.com/kaggle-avatars/thumbnails/3256.png'
      ),
      statusCode: 200
    })
  })
  t.is(
    await kaggle('jhoward'),
    'https://storage.googleapis.com/kaggle-avatars/images/3256.png'
  )
})

test('provider rejects instead of missing when kaggle serves the reCAPTCHA challenge', async t => {
  const { kaggle } = createKaggle({ html: readFixture('challenge') })
  const error = await t.throwsAsync(kaggle('zzqxnope9917'))
  t.is(error.message, 'Empty value returned by the provider.')
  t.is(error.statusCode, 200)
})
