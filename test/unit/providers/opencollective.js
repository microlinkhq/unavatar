'use strict'

const test = require('ava')

const constants = require('../../../src/constant')
const {
  getProfileUrl,
  getAvatarUrl
} = require('../../../src/providers/opencollective')

const createOpenCollective = got =>
  require('../../../src/providers/opencollective')({ constants, got })

test('.getProfileUrl builds encoded profile JSON URL', t => {
  t.is(getProfileUrl('webpack'), 'https://opencollective.com/webpack.json')
  t.is(getProfileUrl('a/b'), 'https://opencollective.com/a%2Fb.json')
})

test('.getAvatarUrl builds resized avatar URL', t => {
  t.is(
    getAvatarUrl({ constants: { AVATAR_SIZE: 400 }, slug: 'webpack' }),
    'https://images.opencollective.com/webpack/avatar/400.png'
  )
})

test('opencollective resolves avatar from the canonical slug when an image is uploaded', async t => {
  const opencollective = createOpenCollective(async (url, opts) => {
    t.is(url, 'https://opencollective.com/Webpack.json')
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    return {
      statusCode: 200,
      body: {
        slug: 'webpack',
        image: 'https://cl.ly/221T14472V23/icon-big_x6ot1e.png'
      }
    }
  })

  t.is(
    await opencollective('Webpack'),
    'https://images.opencollective.com/webpack/avatar/400.png'
  )
})

test('opencollective returns undefined when account has no uploaded image', async t => {
  const opencollective = createOpenCollective(async () => ({
    statusCode: 200,
    body: { slug: 'fastentek-com', image: null }
  }))

  t.is(await opencollective('fastentek-com'), undefined)
})

test('opencollective returns undefined when account is missing', async t => {
  const opencollective = createOpenCollective(async () => ({
    statusCode: 404,
    body: 'Not found'
  }))

  t.is(await opencollective('this-slug-does-not-exist-xyz123'), undefined)
})
