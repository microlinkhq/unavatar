'use strict'

const proxyquire = require('proxyquire').noPreserveCache()
const cheerio = require('cheerio')
const test = require('ava')

const getOgImage = require('../../../src/util/get-og-image')

const createHtmlProvider = opts => opts

test('html provider modules expose expected URL builders', t => {
  const behance = require('../../../src/providers/behance')({
    createHtmlProvider,
    getOgImage
  })
  t.is(behance.url('kikobeats'), 'https://www.behance.net/kikobeats')

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

  const buymeacoffee = require('../../../src/providers/buymeacoffee')({
    createHtmlProvider
  })
  t.is(
    buymeacoffee.url('mikebarnesdrums'),
    'https://buymeacoffee.com/mikebarnesdrums'
  )

  const cults3d = require('../../../src/providers/cults3d')({
    createHtmlProvider,
    getOgImage
  })
  t.is(cults3d.url('kikobeats'), 'https://cults3d.com/en/users/kikobeats')

  const deviantart = require('../../../src/providers/deviantart')({
    createHtmlProvider,
    getOgImage
  })
  t.is(deviantart.url('spyed'), 'https://www.deviantart.com/spyed')

  const facebook = require('../../../src/providers/facebook')({
    createHtmlProvider,
    getOgImage
  })
  t.is(facebook.url('kikobeats'), 'https://www.facebook.com/kikobeats')

  const flickr = require('../../../src/providers/flickr')({
    createHtmlProvider
  })
  t.is(flickr.url('stevebooth'), 'https://www.flickr.com/photos/stevebooth/')
  t.is(
    flickr.url('groups:best100only'),
    'https://www.flickr.com/groups/best100only/'
  )

  const gitlab = require('../../../src/providers/gitlab')({
    createHtmlProvider,
    getOgImage
  })
  t.is(gitlab.url('kikobeats'), 'https://gitlab.com/kikobeats')

  const googlePlay = require('../../../src/providers/google-play')({
    createHtmlProvider,
    getOgImage
  })
  t.is(
    googlePlay.url('app:com.devolver.grispaid'),
    'https://play.google.com/store/apps/details?id=com.devolver.grispaid'
  )
  t.is(
    googlePlay.url('dev:6592603558263828430'),
    'https://play.google.com/store/apps/dev?id=6592603558263828430'
  )

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
  t.is(linkedin.url('user:kikobeats'), 'https://www.linkedin.com/in/kikobeats')
  t.is(
    linkedin.url('company:unavatar'),
    'https://www.linkedin.com/company/unavatar'
  )
  t.is(linkedin.url('school:mit'), 'https://www.linkedin.com/school/mit')

  const twitch = require('../../../src/providers/twitch')({
    createHtmlProvider,
    getOgImage
  })
  t.is(twitch.url('midudev'), 'https://www.twitch.tv/midudev')

  const threads = require('../../../src/providers/threads')({
    createHtmlProvider,
    getOgImage
  })
  t.is(threads.url('zuck'), 'https://www.threads.com/@zuck')
  t.is(threads.url('@zuck'), 'https://www.threads.com/@zuck')

  const thingiverse = require('../../../src/providers/thingiverse')({
    createHtmlProvider,
    getOgImage
  })
  t.is(thingiverse.url('vitaminrad'), 'https://www.thingiverse.com/vitaminrad')

  const tumblr = require('../../../src/providers/tumblr')({
    createHtmlProvider,
    getOgImage
  })
  t.is(tumblr.url('neil-gaiman'), 'https://www.tumblr.com/neil-gaiman')

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

test('printables provider prepends @ to input', t => {
  const printables = require('../../../src/providers/printables')({
    createHtmlProvider,
    getOgImage
  })

  t.is(printables.url('DukeDoks'), 'https://www.printables.com/@DukeDoks')
  t.is(printables.url('@DukeDoks'), 'https://www.printables.com/@DukeDoks')
})

test('soundcloud and substack provider options are derived from helper modules', t => {
  const soundcloud = proxyquire('../../../src/providers/soundcloud', {
    'unique-random-array': () => () => 'mobile-agent'
  })({ createHtmlProvider, getOgImage })

  t.is(soundcloud.url('kikobeats'), 'https://soundcloud.com/kikobeats')
  t.deepEqual(soundcloud.htmlOpts(), {
    headers: { 'user-agent': 'mobile-agent' }
  })

  const snapchat = require('../../../src/providers/snapchat')({
    createHtmlProvider,
    getOgImage
  })
  t.is(
    snapchat.url('teddysdaytoday'),
    'https://www.snapchat.com/@teddysdaytoday'
  )
  t.is(
    snapchat.url('@teddysdaytoday'),
    'https://www.snapchat.com/@teddysdaytoday'
  )

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

  const pinterest = require('../../../src/providers/pinterest')({
    createHtmlProvider
  })
  t.is(pinterest.url('ohjoy'), 'https://www.pinterest.com/ohjoy/')

  const psnprofiles = require('../../../src/providers/psnprofiles')({
    createHtmlProvider,
    getOgImage
  })
  t.is(psnprofiles.url('xGarbett'), 'https://psnprofiles.com/xGarbett')
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
  const instagram = require('../../../src/providers/instagram')({
    createHtmlProvider,
    getOgImage
  })

  const $ = cheerio.load('<html><title>Login • Instagram</title></html>')
  t.is(instagram.getter($), undefined)
})

test('instagram getter returns og:image URL for valid profile page', t => {
  const instagram = require('../../../src/providers/instagram')({
    createHtmlProvider,
    getOgImage
  })

  const avatarUrl =
    'https://scontent-mad2-1.cdninstagram.com/v/t51.82787-19/photo.jpg'
  const $ = cheerio.load(
    '<html><title>Will Smith (@willsmith) • Instagram</title>' +
      `<meta property="og:image" content="${avatarUrl}" />` +
      '</html>'
  )
  t.is(instagram.getter($), avatarUrl)
})

test('facebook getter returns og:image URL from facebook profile markup', t => {
  const facebook = require('../../../src/providers/facebook')({
    createHtmlProvider,
    getOgImage
  })

  const avatarUrl =
    'https://scontent.fvlc9-1.fna.fbcdn.net/v/t1.6435-1/35236976_1682092531844734_8844499721700507648_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=gwFSU-e9uzEQ7kNvwEQbVi-&_nc_oc=AdpqfcGfGq0R8RPfF5Fp57TkIo4YmoowdRQLAz7Tmz5Vd9T95n7V4NbD4NbCAZVgJUA&_nc_zt=24&_nc_ht=scontent.fvlc9-1.fna&_nc_gid=BeZ-mO0z3zh8-QDKxqKaWQ&_nc_ss=7a3a8&oh=00_Af3OkYbHiGtGeSKtM5sTaAYrNN4rhQeGooD0XvkXkceomg&oe=6A06BF45'
  const $ = cheerio.load(
    '<html><title>Kiko Beats | Facebook</title>' +
      `<meta property="og:image" content="${avatarUrl}" />` +
      '</html>'
  )
  t.is(facebook.getter($), avatarUrl)
})

test('psnprofiles getter returns og:image URL for valid profile page', t => {
  const psnprofiles = require('../../../src/providers/psnprofiles')({
    createHtmlProvider,
    getOgImage,
    NOT_FOUND: Symbol('NOT_FOUND')
  })

  const avatarUrl = 'https://i.psnprofiles.com/avatars/l/G12345abcdef.png'
  const $ = cheerio.load(
    "<html><title>xGarbett's PSN Profile</title>" +
      `<meta property="og:image" content="${avatarUrl}" />` +
      '</html>'
  )
  t.is(psnprofiles.getter($), avatarUrl)
})

test('tumblr getter returns og:image URL for valid profile page', t => {
  const tumblr = require('../../../src/providers/tumblr')({
    createHtmlProvider,
    getOgImage
  })

  const avatarUrl =
    'https://64.media.tumblr.com/52f9b593dce4486073bd2527b7461593/62f173cf413c6439-ae/s512x512u_c1/689601fb31221fc5be4156f593008f54a346478c.pnj'
  const $ = cheerio.load(
    '<html><title>@neil-gaiman on Tumblr</title>' +
      `<meta property="og:image" content="${avatarUrl}" />` +
      '</html>'
  )
  t.is(tumblr.getter($), avatarUrl)
})

test('threads getter returns undefined when og:image is missing', t => {
  const threads = require('../../../src/providers/threads')({
    createHtmlProvider,
    getOgImage
  })

  const $ = cheerio.load('<html><title>Threads</title></html>')
  t.is(threads.getter($), undefined)
})

test('threads getter returns og:image URL for valid profile page', t => {
  const threads = require('../../../src/providers/threads')({
    createHtmlProvider,
    getOgImage
  })

  const avatarUrl =
    'https://scontent-mad2-1.cdninstagram.com/v/t51.82787-19/550174606.jpg'
  const $ = cheerio.load(
    '<html><title>Mark Zuckerberg (@zuck) • Threads, Say more</title>' +
      `<meta property="og:image" content="${avatarUrl}" />` +
      '</html>'
  )
  t.is(threads.getter($), avatarUrl)
})
