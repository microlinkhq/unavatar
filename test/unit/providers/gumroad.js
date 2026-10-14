'use strict'

const cheerio = require('cheerio')
const sinon = require('sinon')
const test = require('ava')

const createHtmlProviderFactory = require('../../../src/util/html-provider')
const gumroadFactory = require('../../../src/providers/gumroad')

const { NOT_FOUND } = createHtmlProviderFactory
const { getAvatar, getAvatarUrl, parseInput } = gumroadFactory

const AVATAR_URL =
  'https://public-files.gumroad.com/947cptmnyybtuly3nvyf225dkfyt'
const COVER_URL =
  'https://public-files.gumroad.com/4nsdpuyhfhimvq84s2poxz390gbf'
const DEFAULT_AVATAR_URL =
  'https://assets.gumroad.com/images/gumroad-default-avatar-5.png'

const escapeAttribute = value =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')

const profileHtml = avatarUrl => {
  const page = JSON.stringify({
    component: 'Users/Show',
    props: {
      creator_profile: { name: 'Sahil Lavingia', avatar_url: avatarUrl }
    }
  })
  return (
    '<html><head>' +
    `<meta property="og:image" content="${COVER_URL}">` +
    '</head><body>' +
    `<div id="app" data-page="${escapeAttribute(page)}"></div>` +
    '</body></html>'
  )
}

const NOT_FOUND_HTML =
  '<html><head><title>Page not found (404) - Gumroad</title></head><body></body></html>'

const createGumroad = ({ html, statusCode = 200 }) => {
  const getHTML = sinon.stub().resolves({ $: cheerio.load(html), statusCode })
  const { createHtmlProvider } = createHtmlProviderFactory({
    PROXY_TIMEOUT: 8000,
    getHTML
  })
  return { gumroad: gumroadFactory({ createHtmlProvider, NOT_FOUND }), getHTML }
}

test('.getAvatarUrl builds the creator subdomain URL', t => {
  t.is(getAvatarUrl('sahil'), 'https://sahil.gumroad.com/')
})

test('.parseInput lowercases a valid subdomain label', t => {
  t.is(parseInput('Sahil'), 'sahil')
  t.is(parseInput('my-store-2'), 'my-store-2')
})

test('.parseInput rejects input that could escape the subdomain', t => {
  for (const input of [
    '',
    'evil.com/',
    'evil.com#',
    'a.b',
    'user@evil.com',
    'sahil/../x',
    'sahil?x=1',
    'sahil:8080',
    '-sahil',
    'sahil-',
    'sa hil',
    'a'.repeat(64),
    undefined
  ]) {
    t.is(parseInput(input), undefined, `rejects ${JSON.stringify(input)}`)
  }
})

test('.getAvatar reads creator_profile.avatar_url instead of the og:image cover', t => {
  const $ = cheerio.load(profileHtml(AVATAR_URL))
  t.is(getAvatar({ $, NOT_FOUND }), AVATAR_URL)
})

test('.getAvatar returns NOT_FOUND for the default avatar', t => {
  const $ = cheerio.load(profileHtml(DEFAULT_AVATAR_URL))
  t.is(getAvatar({ $, NOT_FOUND }), NOT_FOUND)
})

test('.getAvatar returns undefined when the page payload is missing', t => {
  const $ = cheerio.load(NOT_FOUND_HTML)
  t.is(getAvatar({ $, NOT_FOUND }), undefined)
})

test('gumroad resolves the creator avatar', async t => {
  const { gumroad, getHTML } = createGumroad({ html: profileHtml(AVATAR_URL) })

  t.is(await gumroad('Sahil', {}), AVATAR_URL)
  t.is(getHTML.firstCall.args[0], 'https://sahil.gumroad.com/')
})

test('gumroad resolves undefined for a creator with the default avatar', async t => {
  const { gumroad } = createGumroad({ html: profileHtml(DEFAULT_AVATAR_URL) })
  t.is(await gumroad('john', {}), undefined)
})

test('gumroad resolves undefined for a missing creator', async t => {
  const { gumroad } = createGumroad({ html: NOT_FOUND_HTML, statusCode: 404 })
  t.is(await gumroad('zzqxnotarealuser98761', {}), undefined)
})

test('gumroad resolves undefined without fetching for an invalid username', async t => {
  const { gumroad, getHTML } = createGumroad({ html: profileHtml(AVATAR_URL) })

  t.is(await gumroad('evil.com/', {}), undefined)
  t.is(getHTML.callCount, 0)
})

test('gumroad exposes getUrl', t => {
  const { gumroad } = createGumroad({ html: NOT_FOUND_HTML })
  t.is(gumroad.getUrl('sahil'), 'https://sahil.gumroad.com/')
})
