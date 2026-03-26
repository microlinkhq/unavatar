'use strict'

const test = require('ava')
const cheerio = require('cheerio')
const proxyquire = require('proxyquire').noPreserveCache()

const createHtmlProvider = opts => opts
const getOgImage = $ =>
  $('meta[property="og:image"]').attr('content') ||
  $('meta[name="og:image"]').attr('content')

test('html provider modules expose expected URL builders', t => {
  const bluesky = proxyquire('../../../src/providers/bluesky', {
    '@metascraper/helpers': {
      $jsonld: path => () => `jsonld:${path}`
    }
  })({ createHtmlProvider })
  t.is(
    bluesky.url('kikobeats.bsky.social'),
    'https://bsky.app/profile/kikobeats.bsky.social'
  )
  t.is(bluesky.getter({}), 'jsonld:mainEntity.image')

  const deviantart = require('../../../src/providers/deviantart')({
    createHtmlProvider,
    getOgImage
  })
  t.is(deviantart.url('spyed'), 'https://www.deviantart.com/spyed')

  const gitlab = require('../../../src/providers/gitlab')({
    createHtmlProvider,
    getOgImage
  })
  t.is(gitlab.url('kikobeats'), 'https://gitlab.com/kikobeats')

  const instagram = require('../../../src/providers/instagram')({
    createHtmlProvider,
    getOgImage
  })
  t.is(instagram.url('willsmith'), 'https://www.instagram.com/willsmith')

  const linkedin = require('../../../src/providers/linkedin')({
    createHtmlProvider,
    getOgImage
  })
  t.is(linkedin.url('kikobeats'), 'https://www.linkedin.com/in/kikobeats')

  const twitch = require('../../../src/providers/twitch')({
    createHtmlProvider,
    getOgImage
  })
  t.is(twitch.url('midudev'), 'https://www.twitch.tv/midudev')

  const vimeo = require('../../../src/providers/vimeo')({
    createHtmlProvider,
    getOgImage
  })
  t.is(vimeo.url('kikobeats'), 'https://vimeo.com/kikobeats')

  const youtube = require('../../../src/providers/youtube')({
    createHtmlProvider,
    getOgImage
  })
  t.is(youtube.url('natelive7'), 'https://www.youtube.com/@natelive7')
})

test('dribbble, reddit and telegram getters read expected HTML attributes', t => {
  const dribbble = require('../../../src/providers/dribbble')({
    createHtmlProvider
  })
  const dribbbleHtml = cheerio.load(
    '<img class="profile-avatar" src="https://a.com/dribbble.png" />'
  )
  t.is(dribbble.url('omidnikrah'), 'https://dribbble.com/omidnikrah')
  t.is(dribbble.getter(dribbbleHtml), 'https://a.com/dribbble.png')

  const reddit = require('../../../src/providers/reddit')({
    createHtmlProvider
  })
  const redditHtml = cheerio.load(
    '<img alt="avatar image" src="https://a.com/reddit.png" />'
  )
  t.is(reddit.url('kikobeats'), 'https://www.reddit.com/user/kikobeats/')
  t.is(reddit.getter(redditHtml), 'https://a.com/reddit.png')
  t.deepEqual(reddit.htmlOpts(), { headers: { 'accept-language': 'en' } })

  const telegram = require('../../../src/providers/telegram')({
    createHtmlProvider
  })
  const telegramHtml = cheerio.load(
    '<img class="tgme_page_photo_image" src="https://a.com/tg.png" />'
  )
  t.is(telegram.url('drsdavidsoft'), 'https://t.me/drsdavidsoft')
  t.is(telegram.getter(telegramHtml), 'https://a.com/tg.png')
})

test('printables provider prepends @ and uses crawler user-agent', t => {
  const printables = proxyquire('../../../src/providers/printables', {
    '../util/crawler-agent': () => 'crawler-agent'
  })({ createHtmlProvider, getOgImage })

  t.is(printables.url('DukeDoks'), 'https://www.printables.com/@DukeDoks')
  t.is(printables.url('@DukeDoks'), 'https://www.printables.com/@DukeDoks')
  t.deepEqual(printables.htmlOpts(), {
    headers: { 'user-agent': 'crawler-agent' }
  })
})

test('soundcloud and substack provider options are derived from helper modules', t => {
  const soundcloud = proxyquire('../../../src/providers/soundcloud', {
    'unique-random-array': () => () => 'mobile-agent'
  })({ createHtmlProvider, getOgImage })

  t.is(soundcloud.url('kikobeats'), 'https://soundcloud.com/kikobeats')
  t.deepEqual(soundcloud.htmlOpts(), {
    headers: { 'user-agent': 'mobile-agent' }
  })

  const substack = proxyquire('../../../src/providers/substack', {
    '@metascraper/helpers': {
      $jsonld: path => () => `jsonld:${path}`
    }
  })({ createHtmlProvider })

  t.is(substack.url('failingwithdata'), 'https://failingwithdata.substack.com')
  t.is(substack.getter({}), 'jsonld:publisher.logo.url')

  const patreon = proxyquire('../../../src/providers/patreon', {
    '@metascraper/helpers': {
      $jsonld: path => () => `jsonld:${path}`
    }
  })({ createHtmlProvider })

  t.is(patreon.url('kikobeats'), 'https://www.patreon.com/kikobeats')
  t.is(patreon.getter({}), 'jsonld:mainEntity.image.contentUrl')

  const instagram = proxyquire('../../../src/providers/instagram', {
    '../util/crawler-agent': () => 'crawler-agent'
  })({ createHtmlProvider, getOgImage })

  t.is(instagram.url('willsmith'), 'https://www.instagram.com/willsmith')
  t.deepEqual(instagram.htmlOpts(), {
    headers: { 'user-agent': 'crawler-agent' }
  })
})

test('linkedin getter returns undefined when og:image is missing', t => {
  const linkedin = require('../../../src/providers/linkedin')({
    createHtmlProvider,
    getOgImage
  })

  const $ = cheerio.load('<html><title>LinkedIn Login</title></html>')
  t.is(linkedin.getter($), undefined)
})

test('linkedin getter returns og:image URL for valid profile page', t => {
  const linkedin = require('../../../src/providers/linkedin')({
    createHtmlProvider,
    getOgImage
  })

  const avatarUrl = 'https://media.licdn.com/dms/image/v2/profile-photo.jpg'
  const $ = cheerio.load(
    '<html><title>Kiko Beats | LinkedIn</title>' +
      `<meta property="og:image" content="${avatarUrl}" />` +
      '</html>'
  )
  t.is(linkedin.getter($), avatarUrl)
})

test('instagram getter returns undefined when og:image is missing', t => {
  const instagram = proxyquire('../../../src/providers/instagram', {
    '../util/crawler-agent': () => 'crawler-agent'
  })({ createHtmlProvider, getOgImage })

  const $ = cheerio.load('<html><title>Login • Instagram</title></html>')
  t.is(instagram.getter($), undefined)
})

test('instagram getter returns og:image URL for valid profile page', t => {
  const instagram = proxyquire('../../../src/providers/instagram', {
    '../util/crawler-agent': () => 'crawler-agent'
  })({ createHtmlProvider, getOgImage })

  const avatarUrl =
    'https://scontent-mad2-1.cdninstagram.com/v/t51.82787-19/photo.jpg'
  const $ = cheerio.load(
    '<html><title>Will Smith (@willsmith) • Instagram</title>' +
      `<meta property="og:image" content="${avatarUrl}" />` +
      '</html>'
  )
  t.is(instagram.getter($), avatarUrl)
})
