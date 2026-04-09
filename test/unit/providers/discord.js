'use strict'

const cheerio = require('cheerio')
const sinon = require('sinon')
const test = require('ava')

const getOgImage = require('../../../src/util/get-og-image')

const {
  getAvatarUrl,
  getGuildIdFromOgImage,
  getInviteCode,
  getInviteUrl
} = require('../../../src/providers/discord')

test('.getInviteCode from raw invite code', t => {
  t.is(getInviteCode('eret'), 'eret')
})

test('.getInviteCode from discord.com invite URL', t => {
  t.is(getInviteCode('https://discord.com/invite/eret'), 'eret')
})

test('.getInviteCode from discord.gg invite URL', t => {
  t.is(getInviteCode('https://discord.gg/eret?event=123'), 'eret')
})

test('.getInviteCode returns undefined for non-Discord URL', t => {
  t.is(getInviteCode('https://example.com/invite/eret'), undefined)
})

test('.getInviteCode returns undefined for unsupported Discord path', t => {
  t.is(getInviteCode('https://discord.com/channels/123'), undefined)
})

test('.getInviteUrl builds canonical Discord invite URL', t => {
  t.is(
    getInviteUrl('https://discord.gg/eret'),
    'https://discord.com/invite/eret'
  )
})

test('.getOgImage extracts og:image from Discord invite HTML', t => {
  const $ = cheerio.load(
    '<html><head>' +
      '<meta property="og:image" content="https://cdn.discordapp.com/splashes/639065840754622475/9a447505db14c30c89483fe4f32a5876.jpg?size=512" />' +
      '</head></html>'
  )

  t.is(
    getOgImage($),
    'https://cdn.discordapp.com/splashes/639065840754622475/9a447505db14c30c89483fe4f32a5876.jpg?size=512'
  )
})

test('.getGuildIdFromOgImage extracts guild id from splash URL', t => {
  t.is(
    getGuildIdFromOgImage(
      'https://cdn.discordapp.com/splashes/639065840754622475/9a447505db14c30c89483fe4f32a5876.jpg?size=512'
    ),
    '639065840754622475'
  )
})

test('.getAvatarUrl transforms invite og:image + icon hash to Discord icon URL', t => {
  t.is(
    getAvatarUrl({
      ogImage:
        'https://cdn.discordapp.com/splashes/639065840754622475/9a447505db14c30c89483fe4f32a5876.jpg?size=512',
      iconHash: '478c3c7a8bdb680844442050c4ead285'
    }),
    'https://cdn.discordapp.com/icons/639065840754622475/478c3c7a8bdb680844442050c4ead285.webp'
  )
})

test('provider resolves guild icon URL from invite page + API metadata', async t => {
  let htmlProviderCalled = false

  const createHtmlProvider =
    ({ name, url, getter }) =>
      async input => {
        htmlProviderCalled = true
        t.is(name, 'discord')
        t.is(url(input), 'https://discord.com/invite/eret')

        const $ = cheerio.load(
          '<meta property="og:image" content="https://cdn.discordapp.com/splashes/639065840754622475/9a447505db14c30c89483fe4f32a5876.jpg?size=512" />'
        )
        return getter($)
      }

  const got = sinon.stub().resolves({
    statusCode: 200,
    body: {
      guild: {
        icon: '478c3c7a8bdb680844442050c4ead285'
      }
    }
  })

  const discord = require('../../../src/providers/discord')({
    createHtmlProvider,
    getOgImage,
    got
  })
  const avatarUrl = await discord('eret')

  t.true(htmlProviderCalled)
  t.is(
    avatarUrl,
    'https://cdn.discordapp.com/icons/639065840754622475/478c3c7a8bdb680844442050c4ead285.webp'
  )
  t.true(got.calledOnce)
  t.is(
    got.firstCall.args[0],
    'https://discord.com/api/v9/invites/eret?with_counts=true&with_expiration=true'
  )
})

test('provider returns undefined when invite page is not found', async t => {
  const got = sinon.stub()
  const discord = require('../../../src/providers/discord')({
    createHtmlProvider: () => async () => undefined,
    getOgImage,
    got
  })
  const avatarUrl = await discord('eret')
  t.is(avatarUrl, undefined)
  t.false(got.called)
})

test('provider returns undefined when API metadata is not found', async t => {
  const got = sinon.stub().resolves({ statusCode: 404, body: {} })

  const discord = require('../../../src/providers/discord')({
    createHtmlProvider:
      ({ getter }) =>
        async () => {
          const $ = cheerio.load(
            '<meta property="og:image" content="https://cdn.discordapp.com/splashes/639065840754622475/9a447505db14c30c89483fe4f32a5876.jpg?size=512" />'
          )
          return getter($)
        },
    getOgImage,
    got
  })

  const avatarUrl = await discord('eret')

  t.is(avatarUrl, undefined)
  t.true(got.calledOnce)
})
