'use strict'

const test = require('ava')

const {
  getAppAvatar,
  getDeveloperAvatar,
  getBundleAvatar,
  getAppNameAvatar,
  getDeveloperNameAvatar
} = require('../../../src/providers/apple-store')

test('apple-store provider defaults to app type', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async (url, opts) => {
      t.is(
        url,
        'https://itunes.apple.com/lookup?id=284882215&entity=software&limit=1'
      )
      t.is(opts.responseType, 'json')
      t.true(opts.resolveBodyOnly)
      return {
        results: [{ kind: 'software', artworkUrl512: 'https://cdn.apple.com/app-512.jpg' }]
      }
    }
  })

  const avatarUrl = await provider('284882215')
  t.is(avatarUrl, 'https://cdn.apple.com/app-512.jpg')
})

test('apple-store provider supports explicit app type with country', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async (url, opts) => {
      t.is(
        url,
        'https://itunes.apple.com/lookup?id=310633997&entity=software&limit=1&country=es'
      )
      t.is(opts.responseType, 'json')
      t.true(opts.resolveBodyOnly)
      return {
        results: [{ kind: 'software', artworkUrl512: 'https://cdn.apple.com/app-es.jpg' }]
      }
    }
  })

  const avatarUrl = await provider('app:310633997@es')
  t.is(avatarUrl, 'https://cdn.apple.com/app-es.jpg')
})

test('apple-store provider supports explicit dev type with country', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async (url, opts) => {
      t.is(
        url,
        'https://itunes.apple.com/lookup?id=284882218&entity=software&limit=200&country=us'
      )
      t.is(opts.responseType, 'json')
      t.true(opts.resolveBodyOnly)
      return {
        results: [
          { wrapperType: 'artist', artistId: 284882218 },
          { kind: 'software', artworkUrl512: 'https://cdn.apple.com/dev-app.jpg' }
        ]
      }
    }
  })

  const avatarUrl = await provider('dev:284882218@US')
  t.is(avatarUrl, 'https://cdn.apple.com/dev-app.jpg')
})

test('apple-store provider supports bundle id lookups', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async (url, opts) => {
      t.is(
        url,
        'https://itunes.apple.com/lookup?bundleId=com.facebook.Facebook&entity=software&limit=1'
      )
      t.is(opts.responseType, 'json')
      t.true(opts.resolveBodyOnly)
      return {
        results: [{ kind: 'software', artworkUrl512: 'https://cdn.apple.com/bundle.jpg' }]
      }
    }
  })

  const avatarUrl = await provider('bundle:com.facebook.Facebook')
  t.is(avatarUrl, 'https://cdn.apple.com/bundle.jpg')
})

test('apple-store provider supports app-url input', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async (url, opts) => {
      t.is(
        url,
        'https://itunes.apple.com/lookup?id=284882215&entity=software&limit=1'
      )
      t.is(opts.responseType, 'json')
      t.true(opts.resolveBodyOnly)
      return {
        results: [{ kind: 'software', artworkUrl512: 'https://cdn.apple.com/from-url.jpg' }]
      }
    }
  })

  const avatarUrl = await provider(
    'app-url:https://apps.apple.com/us/app/facebook/id284882215'
  )
  t.is(avatarUrl, 'https://cdn.apple.com/from-url.jpg')
})

test('apple-store provider supports app-name search', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async (url, opts) => {
      t.is(
        url,
        'https://itunes.apple.com/search?term=whatsapp&entity=software&limit=1'
      )
      t.is(opts.responseType, 'json')
      t.true(opts.resolveBodyOnly)
      return {
        results: [{ kind: 'software', artworkUrl512: 'https://cdn.apple.com/app-name.jpg' }]
      }
    }
  })

  const avatarUrl = await provider('app-name:whatsapp')
  t.is(avatarUrl, 'https://cdn.apple.com/app-name.jpg')
})

test('apple-store provider supports dev-name search with country', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async (url, opts) => {
      t.is(
        url,
        'https://itunes.apple.com/search?term=meta%20platforms&entity=software&attribute=softwareDeveloper&limit=1&country=gb'
      )
      t.is(opts.responseType, 'json')
      t.true(opts.resolveBodyOnly)
      return {
        results: [{ kind: 'software', artworkUrl512: 'https://cdn.apple.com/dev-name.jpg' }]
      }
    }
  })

  const avatarUrl = await provider('dev-name:meta platforms@gb')
  t.is(avatarUrl, 'https://cdn.apple.com/dev-name.jpg')
})

test('apple-store provider throws for invalid app-url values', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async () => ({ results: [] })
  })

  const error = await t.throwsAsync(async () =>
    provider('app-url:https://apps.apple.com/us/developer/meta-platforms-inc')
  )
  t.is(
    error.message,
    'Invalid Apple Store app URL: https://apps.apple.com/us/developer/meta-platforms-inc'
  )
})

test('apple-store provider throws for unsupported type', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async () => ({ results: [] })
  })

  const error = await t.throwsAsync(async () => provider('genre:action'))
  t.is(error.message, 'Unsupported Apple Store type: genre')
})

test('getAppAvatar falls back to artworkUrl100 when artworkUrl512 is missing', async t => {
  const avatarUrl = await getAppAvatar({
    got: async () => ({
      results: [{ kind: 'software', artworkUrl100: 'https://cdn.apple.com/app-100.jpg' }]
    }),
    id: '389801252'
  })

  t.is(avatarUrl, 'https://cdn.apple.com/app-100.jpg')
})

test('getDeveloperAvatar falls back to artworkUrl60 when artworkUrl512 is missing', async t => {
  const avatarUrl = await getDeveloperAvatar({
    got: async () => ({
      results: [{ kind: 'software', artworkUrl60: 'https://cdn.apple.com/dev-60.jpg' }]
    }),
    id: '310634000'
  })

  t.is(avatarUrl, 'https://cdn.apple.com/dev-60.jpg')
})

test('getBundleAvatar returns undefined when lookup is empty', async t => {
  const avatarUrl = await getBundleAvatar({
    got: async () => ({ results: [] }),
    bundleId: 'com.example.missing'
  })

  t.is(avatarUrl, undefined)
})

test('getAppNameAvatar returns undefined when search is empty', async t => {
  const avatarUrl = await getAppNameAvatar({
    got: async () => ({ results: [] }),
    name: 'missing-app'
  })

  t.is(avatarUrl, undefined)
})

test('getDeveloperNameAvatar returns undefined when search is empty', async t => {
  const avatarUrl = await getDeveloperNameAvatar({
    got: async () => ({ results: [] }),
    name: 'missing-dev'
  })

  t.is(avatarUrl, undefined)
})

test('apple-store provider returns undefined when lookup has no software results', async t => {
  const provider = require('../../../src/providers/apple-store')({
    got: async () => ({ results: [{ wrapperType: 'artist', artistId: 1 }] })
  })

  const appAvatar = await provider('app:999')
  const devAvatar = await provider('dev:999')

  t.is(appAvatar, undefined)
  t.is(devAvatar, undefined)
})
