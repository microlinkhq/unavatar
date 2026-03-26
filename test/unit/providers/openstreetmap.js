'use strict'

const test = require('ava')

const {
  OPENSTREETMAP_USER_ID_REGEX
} = require('../../../src/providers/openstreetmap')

test('OPENSTREETMAP_USER_ID_REGEX matches numeric user ids', t => {
  t.true(OPENSTREETMAP_USER_ID_REGEX.test('98672'))
  t.true(OPENSTREETMAP_USER_ID_REGEX.test('0'))
  t.true(OPENSTREETMAP_USER_ID_REGEX.test('123456789'))
})

test('OPENSTREETMAP_USER_ID_REGEX rejects non-numeric input', t => {
  t.false(OPENSTREETMAP_USER_ID_REGEX.test('Terence Eden'))
  t.false(OPENSTREETMAP_USER_ID_REGEX.test('user123'))
  t.false(OPENSTREETMAP_USER_ID_REGEX.test('123abc'))
  t.false(OPENSTREETMAP_USER_ID_REGEX.test(''))
  t.false(OPENSTREETMAP_USER_ID_REGEX.test('12.34'))
})

test('returns avatar URL for numeric user id', async t => {
  let htmlProviderCalled = false

  const gotStub = async (url, opts) => {
    t.is(url, 'https://api.openstreetmap.org/api/0.6/user/98672.json')
    t.is(opts.responseType, 'json')
    return {
      body: {
        user: { img: { href: 'https://www.gravatar.com/avatar/abc.jpg?s=100' } }
      }
    }
  }

  const provider = require('../../../src/providers/openstreetmap')({
    got: gotStub,
    createHtmlProvider: () => async () => {
      htmlProviderCalled = true
    }
  })

  const url = await provider({ input: '98672' })

  t.is(url, 'https://www.gravatar.com/avatar/abc.jpg?s=100')
  t.false(htmlProviderCalled)
})

test('returns avatar URL for username', async t => {
  let gotCalled = false

  const provider = require('../../../src/providers/openstreetmap')({
    got: async () => {
      gotCalled = true
    },
    createHtmlProvider:
      () =>
        async ({ input }) => {
          t.is(input, 'Terence Eden')
          return 'https://www.gravatar.com/avatar/abc.jpg?s=100'
        }
  })

  const url = await provider({ input: 'Terence Eden' })

  t.is(url, 'https://www.gravatar.com/avatar/abc.jpg?s=100')
  t.false(gotCalled)
})

test('returns undefined for username when html provider does not resolve', async t => {
  const provider = require('../../../src/providers/openstreetmap')({
    got: async () => {
      throw new Error('got should not be called for username')
    },
    createHtmlProvider: () => async () => undefined
  })

  const url = await provider({ input: 'missing user' })

  t.is(url, undefined)
})
