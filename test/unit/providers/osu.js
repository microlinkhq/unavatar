'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const getOgImage = require('../../../src/util/get-og-image')
const { NOT_FOUND } = require('../../../src/util/html-provider')

const { getAvatarUrl, getAvatar } = require('../../../src/providers/osu')

const load = ogImage =>
  cheerio.load(
    `<html><head><meta property="og:image" content="${ogImage}"></head></html>`
  )

test('.getAvatarUrl builds osu profile URL from username', t => {
  t.is(getAvatarUrl('peppy'), 'https://osu.ppy.sh/users/peppy')
})

test('.getAvatarUrl builds osu profile URL from numeric user id', t => {
  t.is(getAvatarUrl('7562902'), 'https://osu.ppy.sh/users/7562902')
})

test('.getAvatarUrl encodes usernames with spaces', t => {
  t.is(
    getAvatarUrl('Freddie Benson'),
    'https://osu.ppy.sh/users/Freddie%20Benson'
  )
})

test('.getAvatar returns the a.ppy.sh avatar', t => {
  const avatarUrl = 'https://a.ppy.sh/2?1657169614.png'
  t.is(getAvatar({ $: load(avatarUrl), getOgImage, NOT_FOUND }), avatarUrl)
})

test('.getAvatar treats the guest avatar placeholder as a miss', t => {
  const $ = load('https://osu.ppy.sh/images/layout/avatar-guest@2x.png')
  t.is(getAvatar({ $, getOgImage, NOT_FOUND }), NOT_FOUND)
})

test('.getAvatar returns NOT_FOUND when there is no og:image', t => {
  const $ = cheerio.load('<html><head></head></html>')
  t.is(getAvatar({ $, getOgImage, NOT_FOUND }), NOT_FOUND)
})

const createHtmlProvider = opts => opts

const osu = require('../../../src/providers/osu')({
  createHtmlProvider,
  getOgImage,
  NOT_FOUND
})

test('provider is wired with name, url builder and getter', t => {
  t.is(osu.name, 'osu')
  t.is(osu.url('mrekk'), 'https://osu.ppy.sh/users/mrekk')
  t.is(
    osu.getter(load('https://a.ppy.sh/7562902?1787055713.jpeg')),
    'https://a.ppy.sh/7562902?1787055713.jpeg'
  )
  t.is(
    osu.getter(load('https://osu.ppy.sh/images/layout/avatar-guest@2x.png')),
    NOT_FOUND
  )
})

const createRoutedProvider = ({ statusCode, html }) => {
  const getHTML = async url => {
    getHTML.calledWith = url
    return { $: cheerio.load(html), statusCode, headers: {} }
  }
  const htmlProvider = require('../../../src/util/html-provider')({
    PROXY_TIMEOUT: 8000,
    getHTML
  })
  const provider = require('../../../src/providers/osu')(htmlProvider)
  return { provider, getHTML }
}

const runProvider = (provider, input) =>
  provider(input, { req: { query: {} }, res: { setHeader: () => {} } })

test('resolves the uploaded avatar for an existing user', async t => {
  const { provider, getHTML } = createRoutedProvider({
    statusCode: 200,
    html: '<meta property="og:image" content="https://a.ppy.sh/2?1657169614.png">'
  })

  t.is(
    await runProvider(provider, 'peppy'),
    'https://a.ppy.sh/2?1657169614.png'
  )
  t.is(getHTML.calledWith, 'https://osu.ppy.sh/users/peppy')
})

test('resolves undefined for a user without an uploaded avatar', async t => {
  const { provider } = createRoutedProvider({
    statusCode: 200,
    html: '<meta property="og:image" content="https://osu.ppy.sh/images/layout/avatar-guest@2x.png">'
  })

  t.is(await runProvider(provider, '34000000'), undefined)
})

test('resolves undefined for a missing user', async t => {
  const { provider } = createRoutedProvider({
    statusCode: 404,
    html: '<html><head><title>osu!</title></head></html>'
  })

  t.is(await runProvider(provider, 'zzqxnotarealuser98765'), undefined)
})
