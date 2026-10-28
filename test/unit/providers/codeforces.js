'use strict'

const { default: test } = require('ava')

const { getAvatarUrl, getAvatar } = require('../../../src/providers/codeforces')

const createCodeforces = got =>
  require('../../../src/providers/codeforces')({ got })

test('.getAvatarUrl builds encoded user.info API URL', t => {
  t.is(
    getAvatarUrl('tourist'),
    'https://codeforces.com/api/user.info?handles=tourist'
  )
  t.is(
    getAvatarUrl('a b'),
    'https://codeforces.com/api/user.info?handles=a%20b'
  )
})

test('.getAvatar returns undefined for an empty body', t => {
  t.is(getAvatar(undefined), undefined)
  t.is(getAvatar({ status: 'OK', result: [] }), undefined)
})

test('.getAvatar serves titlePhoto through the codeforces.com userpic mirror', t => {
  t.is(
    getAvatar({
      result: [
        {
          titlePhoto:
            'https://userpic.codeforces.org/422/title/50a270ed4a722867.jpg'
        }
      ]
    }),
    'https://codeforces.com/userpic.codeforces.org/422/title/50a270ed4a722867.jpg'
  )
})

test('.getAvatar keeps titlePhoto hosted elsewhere untouched', t => {
  t.is(
    getAvatar({ result: [{ titlePhoto: 'https://example.com/photo.jpg' }] }),
    'https://example.com/photo.jpg'
  )
})

test('codeforces resolves titlePhoto from user.info', async t => {
  const codeforces = createCodeforces(async (url, opts) => {
    t.is(url, 'https://codeforces.com/api/user.info?handles=tourist')
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    return {
      statusCode: 200,
      body: {
        status: 'OK',
        result: [
          {
            handle: 'tourist',
            titlePhoto:
              'https://userpic.codeforces.org/422/title/50a270ed4a722867.jpg',
            avatar:
              'https://userpic.codeforces.org/422/avatar/2b5dbe87f0d859a2.jpg'
          }
        ]
      }
    }
  })

  t.is(
    await codeforces('tourist'),
    'https://codeforces.com/userpic.codeforces.org/422/title/50a270ed4a722867.jpg'
  )
})

test('codeforces returns undefined for the default photo', async t => {
  const codeforces = createCodeforces(async () => ({
    statusCode: 200,
    body: {
      status: 'OK',
      result: [
        {
          handle: 'test',
          titlePhoto: 'https://userpic.codeforces.org/no-title.jpg',
          avatar: 'https://userpic.codeforces.org/no-avatar.jpg'
        }
      ]
    }
  }))

  t.is(await codeforces('test'), undefined)
})

test('codeforces returns undefined when handle is missing', async t => {
  const codeforces = createCodeforces(async () => ({
    statusCode: 400,
    body: {
      status: 'FAILED',
      comment: 'handles: User with handle missing not found'
    }
  }))

  t.is(await codeforces('missing'), undefined)
})

test('codeforces rejects multiple handles without calling the API', async t => {
  const codeforces = createCodeforces(async () => {
    t.fail('got should not be called')
  })

  t.is(await codeforces('tourist;test'), undefined)
})
