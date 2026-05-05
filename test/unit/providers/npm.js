'use strict'

const test = require('ava')

const createNpmProvider = require('../../../src/providers/npm')

const createMockGot = response => async () => ({ body: response })

test('returns github avatar URL from npm registry', async t => {
  const got = createMockGot({
    objects: [
      {
        package: {
          publisher: { username: 'mafintosh' },
          links: { repository: 'git://github.com/mafintosh/pump.git' }
        }
      }
    ]
  })

  const npm = createNpmProvider({ constants: { AVATAR_SIZE: 400 }, got })
  const result = await npm('mafintosh')

  t.is(result, 'https://github.com/mafintosh.png?size=400')
})

test('strips @ prefix from input', async t => {
  const got = createMockGot({
    objects: [
      {
        package: {
          publisher: { username: 'kikobeats' },
          links: { repository: 'https://github.com/kikobeats/emojis-list' }
        }
      }
    ]
  })

  const npm = createNpmProvider({ constants: { AVATAR_SIZE: 400 }, got })
  const result = await npm('@kikobeats')

  t.is(result, 'https://github.com/kikobeats.png?size=400')
})

test('filters packages by publisher username', async t => {
  const got = createMockGot({
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
  })

  const npm = createNpmProvider({ constants: { AVATAR_SIZE: 400 }, got })
  const result = await npm('mafintosh')

  t.is(result, 'https://github.com/mafintosh.png?size=400')
})

test('returns undefined when no github repository found', async t => {
  const got = createMockGot({
    objects: [
      {
        package: {
          publisher: { username: 'noghuser' },
          links: { npm: 'https://www.npmjs.com/package/foo' }
        }
      }
    ]
  })

  const npm = createNpmProvider({ constants: { AVATAR_SIZE: 400 }, got })
  const result = await npm('noghuser')

  t.is(result, undefined)
})

test('returns undefined when no packages found', async t => {
  const got = createMockGot({ objects: [] })

  const npm = createNpmProvider({ constants: { AVATAR_SIZE: 400 }, got })
  const result = await npm('nonexistent')

  t.is(result, undefined)
})
