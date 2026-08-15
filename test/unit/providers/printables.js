'use strict'

const test = require('ava')

const {
  getAvatar,
  normalizeHandle
} = require('../../../src/providers/printables')

const createPrintables = got =>
  require('../../../src/providers/printables')({ got })

const avatarPath = 'media/auth/avatars/cd/cd02bb1d.jpg'
const avatarUrl = `https://media.printables.com/${avatarPath}`

const searchBody = {
  data: {
    result: {
      items: [{ handle: 'DukeDoks', avatarFilePath: avatarPath }]
    }
  }
}

test('.normalizeHandle strips a leading @', t => {
  t.is(normalizeHandle('@DukeDoks'), 'DukeDoks')
  t.is(normalizeHandle('DukeDoks'), 'DukeDoks')
  t.is(normalizeHandle(' @DukeDoks '), 'DukeDoks')
})

test('.getAvatar returns the media URL for an exact handle', t => {
  t.is(getAvatar(searchBody, 'DukeDoks'), avatarUrl)
})

test('.getAvatar matches handle case-insensitively', t => {
  t.is(getAvatar(searchBody, 'dukedoks'), avatarUrl)
})

test('.getAvatar ignores other search hits', t => {
  t.is(
    getAvatar(
      {
        data: {
          result: {
            items: [
              { handle: 'Duke', avatarFilePath: 'media/other.jpg' },
              { handle: 'DukeDoks', avatarFilePath: avatarPath }
            ]
          }
        }
      },
      'DukeDoks'
    ),
    avatarUrl
  )
})

test('.getAvatar treats a missing avatar as a miss', t => {
  t.is(getAvatar({ data: { result: { items: [] } } }, 'DukeDoks'), undefined)
  t.is(
    getAvatar(
      { data: { result: { items: [{ handle: 'DukeDoks' }] } } },
      'DukeDoks'
    ),
    undefined
  )
})

test('printables resolves the avatar from GraphQL', async t => {
  const printables = createPrintables(async (url, opts) => {
    t.is(url, 'https://api.printables.com/graphql/')
    t.is(opts.method, 'POST')
    t.is(opts.json.variables.query, 'DukeDoks')
    return { statusCode: 200, body: searchBody }
  })

  t.is(await printables('@DukeDoks'), avatarUrl)
})

test('printables returns undefined when the user is missing', async t => {
  const printables = createPrintables(async () => ({
    statusCode: 200,
    body: { data: { result: { items: [] } } }
  }))

  t.is(await printables('missing'), undefined)
})
