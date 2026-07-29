'use strict'

const test = require('ava')
const proxyquire = require('proxyquire').noPreserveCache()
const Keyv = require('@keyvhq/core')

const createProviderWith = ({ gotStub }) =>
  proxyquire('../../../src/providers/apple-music', {
    '@metascraper/helpers': {
      $jsonld: () => () => 'og-image'
    }
  })({
    got: gotStub,
    itunesSearchCache: new Keyv({
      namespace: 'itunes-search-test',
      store: new Map()
    }),
    createHtmlProvider:
      ({ url }) =>
        async input =>
          url(input)
  })

test('apple-music provider keeps numeric typed artist ids as-is', async t => {
  let gotCalled = false

  const provider = createProviderWith({
    gotStub: async () => {
      gotCalled = true
      return { results: [{ artistId: 123 }] }
    }
  })

  const url = await provider('artist:5468295')

  t.is(url, 'https://music.apple.com/us/artist/5468295')
  t.false(gotCalled)
})

test('apple-music provider treats untyped numeric values as queries', async t => {
  const calls = []
  const provider = createProviderWith({
    gotStub: async url => {
      calls.push(url)
      if (url.includes('entity=musicArtist')) { return { results: [{ artistId: 'not-a-number' }] } }
      if (url.includes('entity=song')) { return { results: [{ trackId: 697195787 }] } }
      return { results: [{ collectionId: 'not-a-number' }] }
    }
  })

  const url = await provider('697195787')

  t.is(url, 'https://music.apple.com/us/song/697195787')
  t.is(calls.length, 2)
  t.true(calls[0].includes('entity=musicArtist'))
  t.true(calls[1].includes('entity=song'))
})

test('apple-music provider resolves artist ids from iTunes search', async t => {
  const provider = createProviderWith({
    gotStub: async (url, opts) => {
      t.true(url.includes('https://itunes.apple.com/search?term=daft%20punk'))
      t.true(url.includes('entity=musicArtist'))
      t.true(url.includes('limit=1'))
      t.is(opts.responseType, 'json')
      t.true(opts.resolveBodyOnly)

      return { results: [{ artistId: 5468295 }] }
    }
  })

  const url = await provider('daft punk')

  t.is(url, 'https://music.apple.com/us/artist/5468295')
})

test('apple-music provider memoizes iTunes lookups across repeated calls', async t => {
  let gotCalls = 0
  const provider = createProviderWith({
    gotStub: async (url, opts) => {
      gotCalls++
      t.true(url.includes('https://itunes.apple.com/search?term=daft%20punk'))
      t.true(url.includes('entity=musicArtist'))
      t.true(url.includes('limit=1'))
      t.is(opts.responseType, 'json')
      t.true(opts.resolveBodyOnly)
      return { results: [{ artistId: 5468295 }] }
    }
  })

  const first = await provider('daft punk')
  const second = await provider('daft punk')

  t.is(first, 'https://music.apple.com/us/artist/5468295')
  t.is(second, 'https://music.apple.com/us/artist/5468295')
  t.is(gotCalls, 1)
})

test('apple-music provider default query falls back from artist to song', async t => {
  const calls = []
  const provider = createProviderWith({
    gotStub: async url => {
      calls.push(url)
      if (url.includes('entity=musicArtist')) { return { results: [{ artistId: 'not-a-number' }] } }
      if (url.includes('entity=song')) { return { results: [{ trackId: 697195787 }] } }
      return { results: [{ collectionId: 'not-a-number' }] }
    }
  })

  const url = await provider('harder better faster stronger')

  t.is(url, 'https://music.apple.com/us/song/697195787')
  t.is(calls.length, 2)
  t.true(calls[0].includes('entity=musicArtist'))
  t.true(calls[1].includes('entity=song'))
})

test('apple-music provider default query falls back from artist and song to album', async t => {
  const calls = []
  const provider = createProviderWith({
    gotStub: async url => {
      calls.push(url)
      if (url.includes('entity=album')) { return { results: [{ collectionId: 697194953 }] } }
      return {
        results: [{ artistId: 'not-a-number', trackId: 'not-a-number' }]
      }
    }
  })

  const url = await provider('discovery')

  t.is(url, 'https://music.apple.com/us/album/697194953')
  t.is(calls.length, 3)
  t.true(calls[0].includes('entity=musicArtist'))
  t.true(calls[1].includes('entity=song'))
  t.true(calls[2].includes('entity=album'))
})

test('apple-music provider resolves typed artist names from iTunes search', async t => {
  const provider = createProviderWith({
    gotStub: async (url, opts) => {
      t.true(url.includes('https://itunes.apple.com/search?term=daft%20punk'))
      t.true(url.includes('entity=musicArtist'))
      t.true(url.includes('limit=1'))
      t.is(opts.responseType, 'json')
      t.true(opts.resolveBodyOnly)

      return { results: [{ artistId: '5468295' }] }
    }
  })

  const url = await provider('artist:daft punk')

  t.is(url, 'https://music.apple.com/us/artist/5468295')
})

test('apple-music provider keeps numeric typed album ids as-is', async t => {
  let gotCalled = false
  const provider = createProviderWith({
    gotStub: async () => {
      gotCalled = true
      return { results: [{ artistId: 5468295 }] }
    }
  })

  const url = await provider('album:1441164495')

  t.is(url, 'https://music.apple.com/us/album/1441164495')
  t.false(gotCalled)
})

test('apple-music provider resolves typed album names from iTunes search', async t => {
  const provider = createProviderWith({
    gotStub: async (url, opts) => {
      t.true(url.includes('https://itunes.apple.com/search?term=discovery'))
      t.true(url.includes('entity=album'))
      t.true(url.includes('limit=1'))
      t.is(opts.responseType, 'json')
      t.true(opts.resolveBodyOnly)

      return { results: [{ collectionId: 697194953 }] }
    }
  })

  const url = await provider('album:discovery')

  t.is(url, 'https://music.apple.com/us/album/697194953')
})

test('apple-music provider falls back to encoded search query when iTunes id is invalid', async t => {
  const provider = createProviderWith({
    gotStub: async () => ({ results: [{ artistId: 'not-a-number' }] })
  })

  const url = await provider('daft punk')

  t.is(url, 'https://music.apple.com/us/search?term=daft%20punk')
})

test('apple-music provider falls back to encoded album query when iTunes id is invalid', async t => {
  const provider = createProviderWith({
    gotStub: async () => ({ results: [{ collectionId: 'not-a-number' }] })
  })

  const url = await provider('album:random access memories')

  t.is(url, 'https://music.apple.com/us/album/random%20access%20memories')
})

test('apple-music provider resolves typed song names from iTunes search', async t => {
  const provider = createProviderWith({
    gotStub: async (url, opts) => {
      t.true(
        url.includes(
          'https://itunes.apple.com/search?term=harder%20better%20faster%20stronger'
        )
      )
      t.true(url.includes('entity=song'))
      t.true(url.includes('limit=1'))
      t.is(opts.responseType, 'json')
      t.true(opts.resolveBodyOnly)

      return { results: [{ trackId: 697195787 }] }
    }
  })

  const url = await provider('song:harder better faster stronger')

  t.is(url, 'https://music.apple.com/us/song/697195787')
})

test('apple-music provider keeps numeric typed song ids as-is', async t => {
  let gotCalled = false
  const provider = createProviderWith({
    gotStub: async () => {
      gotCalled = true
      return { results: [{ trackId: 697195787 }] }
    }
  })

  const url = await provider('song:697195787')

  t.is(url, 'https://music.apple.com/us/song/697195787')
  t.false(gotCalled)
})

test('apple-music provider falls back to encoded song query when iTunes id is invalid', async t => {
  const provider = createProviderWith({
    gotStub: async () => ({ results: [{ trackId: 'not-a-number' }] })
  })

  const url = await provider('song:harder better faster stronger')

  t.is(
    url,
    'https://music.apple.com/us/song/harder%20better%20faster%20stronger'
  )
})
