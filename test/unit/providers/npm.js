'use strict'

const test = require('ava')

const createNpmProvider = require('../../../src/providers/npm')

const createMockGot = responses => {
  const calls = []
  const got = async (url, opts) => {
    calls.push({ url, opts })
    for (const [pattern, body] of responses) {
      if (url.includes(pattern)) return { body }
    }
    return { body: null }
  }
  got.calls = calls
  return got
}

test('returns github avatar URL from npm registry', async t => {
  const got = createMockGot([
    [
      'registry.npmjs.org',
      {
        objects: [
          {
            package: {
              publisher: { username: 'mafintosh' },
              links: { repository: 'git://github.com/mafintosh/pump.git' }
            }
          }
        ]
      }
    ]
  ])

  const npm = createNpmProvider({ constants: { AVATAR_SIZE: 400 }, got })
  const result = await npm('mafintosh')

  t.is(result, 'https://github.com/mafintosh.png?size=400')
})

test('strips @ prefix from input', async t => {
  const got = createMockGot([
    [
      'registry.npmjs.org',
      {
        objects: [
          {
            package: {
              publisher: { username: 'kikobeats' },
              links: { repository: 'https://github.com/kikobeats/emojis-list' }
            }
          }
        ]
      }
    ]
  ])

  const npm = createNpmProvider({ constants: { AVATAR_SIZE: 400 }, got })
  const result = await npm('@kikobeats')

  t.is(result, 'https://github.com/kikobeats.png?size=400')
})

test('filters packages by publisher username', async t => {
  const got = createMockGot([
    [
      'registry.npmjs.org',
      {
        objects: [
          {
            package: {
              publisher: { username: 'other-user' },
              links: { repository: 'https://github.com/other-user/pkg.git' }
            }
          },
          {
            package: {
              publisher: { username: 'mafintosh' },
              links: { repository: 'https://github.com/mafintosh/pump.git' }
            }
          }
        ]
      }
    ]
  ])

  const npm = createNpmProvider({ constants: { AVATAR_SIZE: 400 }, got })
  const result = await npm('mafintosh')

  t.is(result, 'https://github.com/mafintosh.png?size=400')
})

test('returns gitlab avatar URL when repo is on gitlab', async t => {
  const got = createMockGot([
    [
      'registry.npmjs.org',
      {
        objects: [
          {
            package: {
              publisher: { username: 'dmfay' },
              links: {
                repository: 'git+https://gitlab.com/dmfay/massive-js.git'
              }
            }
          }
        ]
      }
    ],
    [
      'gitlab.com/api/v4',
      [
        {
          avatar_url:
            'https://gitlab.com/uploads/-/system/user/avatar/920703/avatar.png'
        }
      ]
    ]
  ])

  const npm = createNpmProvider({ constants: { AVATAR_SIZE: 400 }, got })
  const result = await npm('dmfay')

  t.is(
    result,
    'https://gitlab.com/uploads/-/system/user/avatar/920703/avatar.png'
  )
})

test('prefers github over gitlab when both exist', async t => {
  const got = createMockGot([
    [
      'registry.npmjs.org',
      {
        objects: [
          {
            package: {
              publisher: { username: 'user' },
              links: { repository: 'https://gitlab.com/user/pkg1.git' }
            }
          },
          {
            package: {
              publisher: { username: 'user' },
              links: { repository: 'https://github.com/user/pkg2.git' }
            }
          }
        ]
      }
    ]
  ])

  const npm = createNpmProvider({ constants: { AVATAR_SIZE: 400 }, got })
  const result = await npm('user')

  t.is(result, 'https://github.com/user.png?size=400')
})

test('returns undefined when no repository found', async t => {
  const got = createMockGot([
    [
      'registry.npmjs.org',
      {
        objects: [
          {
            package: {
              publisher: { username: 'noghuser' },
              links: { npm: 'https://www.npmjs.com/package/foo' }
            }
          }
        ]
      }
    ]
  ])

  const npm = createNpmProvider({ constants: { AVATAR_SIZE: 400 }, got })
  const result = await npm('noghuser')

  t.is(result, undefined)
})

test('returns undefined when no packages found', async t => {
  const got = createMockGot([['registry.npmjs.org', { objects: [] }]])

  const npm = createNpmProvider({ constants: { AVATAR_SIZE: 400 }, got })
  const result = await npm('nonexistent')

  t.is(result, undefined)
})
