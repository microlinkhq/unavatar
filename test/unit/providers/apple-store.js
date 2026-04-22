'use strict'

const test = require('ava')
const Keyv = require('@keyvhq/core')

const {
  getAppAvatar,
  getAppNameAvatar
} = require('../../../src/providers/apple-store')

test('apple-store provider defaults to id type', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async (url, opts) => {
      t.is(
        url,
        'https://itunes.apple.com/lookup?id=284882215&entity=software&limit=1'
      )
      t.is(opts.responseType, 'json')
      t.true(opts.resolveBodyOnly)
      return {
        results: [
          {
            kind: 'software',
            artworkUrl512: 'https://cdn.apple.com/app-512.jpg'
          }
        ]
      }
    }
  })

  const avatarUrl = await provider('284882215')
  t.is(avatarUrl, 'https://cdn.apple.com/app-512.jpg')
})

test('apple-store provider supports explicit id type with country', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async (url, opts) => {
      t.is(
        url,
        'https://itunes.apple.com/lookup?id=310633997&entity=software&limit=1&country=es'
      )
      t.is(opts.responseType, 'json')
      t.true(opts.resolveBodyOnly)
      return {
        results: [
          {
            kind: 'software',
            artworkUrl512: 'https://cdn.apple.com/app-es.jpg'
          }
        ]
      }
    }
  })

  const avatarUrl = await provider('id:310633997@es')
  t.is(avatarUrl, 'https://cdn.apple.com/app-es.jpg')
})

test('apple-store provider supports exact name search', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async (url, opts) => {
      t.is(
        url,
        'https://itunes.apple.com/search?term=whatsapp%20messenger&entity=software&limit=1'
      )
      t.is(opts.responseType, 'json')
      t.true(opts.resolveBodyOnly)
      return {
        results: [
          {
            trackName: 'WhatsApp Messenger',
            trackCensoredName: 'WhatsApp Messenger',
            kind: 'software',
            artworkUrl512: 'https://cdn.apple.com/app-name.jpg'
          }
        ]
      }
    }
  })

  const avatarUrl = await provider('name:whatsapp messenger')
  t.is(avatarUrl, 'https://cdn.apple.com/app-name.jpg')
})

test('apple-store provider memoizes name iTunes search lookups', async t => {
  let gotCalls = 0
  const provider = require('../../../src/providers/apple-store')({
    got: async (url, opts) => {
      gotCalls++
      t.is(
        url,
        'https://itunes.apple.com/search?term=whatsapp%20messenger&entity=software&limit=1'
      )
      t.is(opts.responseType, 'json')
      t.true(opts.resolveBodyOnly)
      return {
        results: [
          {
            trackName: 'WhatsApp Messenger',
            trackCensoredName: 'WhatsApp Messenger',
            kind: 'software',
            artworkUrl512: 'https://cdn.apple.com/app-name.jpg'
          }
        ]
      }
    },
    itunesSearchCache: new Keyv({
      namespace: 'itunes-search-test',
      store: new Map()
    })
  })

  const first = await provider('name:whatsapp messenger')
  const second = await provider('name:whatsapp messenger')

  t.is(first, 'https://cdn.apple.com/app-name.jpg')
  t.is(second, 'https://cdn.apple.com/app-name.jpg')
  t.is(gotCalls, 1)
})

test('apple-store provider returns undefined when only partial matches exist', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async () => ({
      results: [
        {
          kind: 'software',
          trackName: 'Supercell Network',
          trackCensoredName: 'Supercell Network',
          artistName: 'Supercell',
          artworkUrl512: 'https://cdn.apple.com/supercell-network.jpg'
        }
      ]
    })
  })

  const avatarUrl = await provider('name:supercell')
  t.is(avatarUrl, undefined)
})

test('apple-store provider throws for unsupported app-url type', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async () => ({ results: [] })
  })

  const error = await t.throwsAsync(async () =>
    provider('app-url:https://apps.apple.com/us/developer/meta-platforms-inc')
  )
  t.is(error.message, 'Unsupported Apple Store type: app-url')
})

test('apple-store provider throws for unsupported type', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async () => ({ results: [] })
  })

  const error = await t.throwsAsync(async () => provider('genre:action'))
  t.is(error.message, 'Unsupported Apple Store type: genre')
})

test('apple-store provider throws for dev type', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async () => ({ results: [] })
  })

  const error = await t.throwsAsync(async () => provider('dev:488106216'))
  t.is(error.message, 'Unsupported Apple Store type: dev')
})

test('apple-store provider throws for dev-name type', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async () => ({ results: [] })
  })

  const error = await t.throwsAsync(async () => provider('dev-name:supercell'))
  t.is(error.message, 'Unsupported Apple Store type: dev-name')
})

test('apple-store provider throws for bundle type', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async () => ({ results: [] })
  })

  const error = await t.throwsAsync(async () =>
    provider('bundle:com.spotify.client')
  )
  t.is(error.message, 'Unsupported Apple Store type: bundle')
})

test('getAppAvatar falls back to artworkUrl100 when artworkUrl512 is missing', async t => {
  const avatarUrl = await getAppAvatar({
    got: async () => ({
      results: [
        { kind: 'software', artworkUrl100: 'https://cdn.apple.com/app-100.jpg' }
      ]
    }),
    id: '389801252'
  })

  t.is(avatarUrl, 'https://cdn.apple.com/app-100.jpg')
})

test('getAppNameAvatar returns undefined when search is empty', async t => {
  const avatarUrl = await getAppNameAvatar({
    got: async () => ({ results: [] }),
    name: 'missing-app'
  })

  t.is(avatarUrl, undefined)
})

test('apple-store provider returns undefined when lookup has no software results', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async () => ({ results: [{ wrapperType: 'artist', artistId: 1 }] })
  })

  const appAvatar = await provider('id:999')

  t.is(appAvatar, undefined)
})
