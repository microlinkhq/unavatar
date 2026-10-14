'use strict'

const test = require('ava')

const {
  getAvatar,
  getAvatarUrl,
  parseInput
} = require('../../../src/providers/farcaster')

const createFarcaster = got =>
  require('../../../src/providers/farcaster')({ got })

const avatarUrl =
  'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/bc698287-5adc-4cc5-a503-de16963ed900/original'

const userBody = {
  result: { user: { username: 'dwr', pfp: { url: avatarUrl } } }
}

test('.parseInput strips a leading @, whitespace, and lowercases', t => {
  t.is(parseInput('dwr'), 'dwr')
  t.is(parseInput('@dwr'), 'dwr')
  t.is(parseInput('  @DWR '), 'dwr')
  t.is(parseInput('vitalik.eth'), 'vitalik.eth')
  t.is(parseInput('jesse.base.eth'), 'jesse.base.eth')
})

test('.getAvatarUrl builds the user-by-username API URL', t => {
  t.is(
    getAvatarUrl('@dwr'),
    'https://api.warpcast.com/v2/user-by-username?username=dwr'
  )
  t.is(
    getAvatarUrl('vitalik.eth'),
    'https://api.warpcast.com/v2/user-by-username?username=vitalik.eth'
  )
})

test('.getAvatarUrl encodes the username', t => {
  t.is(
    getAvatarUrl('a&b=c'),
    'https://api.warpcast.com/v2/user-by-username?username=a%26b%3Dc'
  )
})

test('.getAvatar returns the pfp url', t => {
  t.is(getAvatar(userBody), avatarUrl)
})

test('.getAvatar treats a missing or empty pfp as a miss', t => {
  t.is(getAvatar(undefined), undefined)
  t.is(getAvatar({}), undefined)
  t.is(getAvatar({ result: { user: {} } }), undefined)
  t.is(getAvatar({ result: { user: { pfp: {} } } }), undefined)
  t.is(getAvatar({ result: { user: { pfp: { url: '' } } } }), undefined)
  t.is(getAvatar({ result: { user: { pfp: { url: null } } } }), undefined)
})

test('farcaster resolves the avatar from the Warpcast API', async t => {
  const farcaster = createFarcaster(async (url, opts) => {
    t.is(url, 'https://api.warpcast.com/v2/user-by-username?username=dwr')
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    return { statusCode: 200, body: userBody }
  })

  t.is(await farcaster('@DWR'), avatarUrl)
})

test('farcaster returns undefined when the username does not exist', async t => {
  const farcaster = createFarcaster(async () => ({
    statusCode: 404,
    body: {
      errors: [{ message: 'No FID associated with username zzqxnotreal9' }]
    }
  }))

  t.is(await farcaster('zzqxnotreal9'), undefined)
})

test('farcaster returns undefined when the username is invalid', async t => {
  const farcaster = createFarcaster(async () => ({
    statusCode: 400,
    body: {
      errors: [
        {
          instancePath: '/username',
          keyword: 'pattern',
          message:
            'must match pattern "^[0-9a-z][0-9a-z-]{0,15}(\\.eth|\\.base\\.eth)?$"'
        }
      ]
    }
  }))

  t.is(await farcaster('bad_name'), undefined)
})
