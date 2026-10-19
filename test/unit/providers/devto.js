'use strict'

const { default: test } = require('ava')

const constants = require('../../../src/constant')
const createDevto = require('../../../src/providers/devto')
const { parseInput, getUserAvatarUrl, getOrganizationAvatarUrl, getAvatar } =
  createDevto

const BEN_PROFILE_IMAGE =
  'https://media2.dev.to/dynamic/image/width=320,height=320,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1%2Fbabb96d0-9cd2-49bc-a412-2dc4caf94c2a.png'
const BEN_ORIGINAL_IMAGE =
  'https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/user/profile_image/1/babb96d0-9cd2-49bc-a412-2dc4caf94c2a.png'
const BEN_AVATAR_IMAGE =
  'https://media2.dev.to/dynamic/image/width=400,height=400,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1%2Fbabb96d0-9cd2-49bc-a412-2dc4caf94c2a.png'

const DEVTEAM_PROFILE_IMAGE =
  'https://media2.dev.to/dynamic/image/width=640,height=640,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Forganization%2Fprofile_image%2F1%2Fd908a186-5651-4a5a-9f76-15200bc6801f.jpg'
const DEVTEAM_AVATAR_IMAGE =
  'https://media2.dev.to/dynamic/image/width=400,height=400,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Forganization%2Fprofile_image%2F1%2Fd908a186-5651-4a5a-9f76-15200bc6801f.jpg'

const PLACEHOLDER_ORIGINAL_IMAGE =
  'https://thepracticaldev.s3.amazonaws.com/i/99mvlsfu5tfj9m7ku25d.png'
const PLACEHOLDER_PROFILE_IMAGE =
  'https://media2.dev.to/dynamic/image/width=320,height=320,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fthepracticaldev.s3.amazonaws.com%2Fi%2F99mvlsfu5tfj9m7ku25d.png'

const NOT_FOUND = { statusCode: 404, body: { error: 'not found', status: 404 } }

const createGot = responses => {
  const calls = []
  const got = async (url, opts) => {
    calls.push({ url, opts })
    return responses[url] ?? NOT_FOUND
  }
  got.calls = calls
  return got
}

test('.parseInput strips @ and lowercases', t => {
  t.is(parseInput('@Ben'), 'ben')
  t.is(parseInput(' kikobeats '), 'kikobeats')
})

test('.getUserAvatarUrl builds encoded by_username API URL', t => {
  t.is(getUserAvatarUrl('ben'), 'https://dev.to/api/users/by_username?url=ben')
  t.is(
    getUserAvatarUrl('a/b?c'),
    'https://dev.to/api/users/by_username?url=a%2Fb%3Fc'
  )
})

test('.getOrganizationAvatarUrl builds encoded organization API URL', t => {
  t.is(
    getOrganizationAvatarUrl('devteam'),
    'https://dev.to/api/organizations/devteam'
  )
  t.is(
    getOrganizationAvatarUrl('a/b'),
    'https://dev.to/api/organizations/a%2Fb'
  )
})

const SIZE = constants.AVATAR_SIZE

test('.getAvatar requests the resize wrapper at the given size', t => {
  t.is(
    getAvatar({ body: { profile_image: BEN_PROFILE_IMAGE }, size: SIZE }),
    BEN_AVATAR_IMAGE
  )
  t.is(
    getAvatar({ body: { profile_image: DEVTEAM_PROFILE_IMAGE }, size: SIZE }),
    DEVTEAM_AVATAR_IMAGE
  )
})

test('.getAvatar keeps URLs that are not resize wrappers', t => {
  t.is(
    getAvatar({ body: { profile_image: BEN_ORIGINAL_IMAGE }, size: SIZE }),
    BEN_ORIGINAL_IMAGE
  )
})

test('.getAvatar treats the default placeholder as a miss', t => {
  t.is(
    getAvatar({
      body: { profile_image: PLACEHOLDER_PROFILE_IMAGE },
      size: SIZE
    }),
    undefined
  )
  t.is(
    getAvatar({
      body: { profile_image: PLACEHOLDER_ORIGINAL_IMAGE },
      size: SIZE
    }),
    undefined
  )
})

test('.getAvatar returns undefined without a profile image', t => {
  t.is(getAvatar({ body: {}, size: SIZE }), undefined)
  t.is(getAvatar({ body: { profile_image: '' }, size: SIZE }), undefined)
  t.is(getAvatar({ body: undefined, size: SIZE }), undefined)
})

test('devto resolves the user avatar at AVATAR_SIZE', async t => {
  const got = createGot({
    'https://dev.to/api/users/by_username?url=ben': {
      statusCode: 200,
      body: { username: 'ben', profile_image: BEN_PROFILE_IMAGE }
    }
  })

  const devto = createDevto({ constants, got })

  t.is(await devto('@Ben'), BEN_AVATAR_IMAGE)
  t.deepEqual(got.calls, [
    {
      url: 'https://dev.to/api/users/by_username?url=ben',
      opts: { responseType: 'json', throwHttpErrors: false }
    }
  ])
})

test('devto falls back to organizations', async t => {
  const got = createGot({
    'https://dev.to/api/organizations/devteam': {
      statusCode: 200,
      body: { username: 'devteam', profile_image: DEVTEAM_PROFILE_IMAGE }
    }
  })

  const devto = createDevto({ constants, got })

  t.is(await devto('devteam'), DEVTEAM_AVATAR_IMAGE)
  t.deepEqual(
    got.calls.map(({ url }) => url),
    [
      'https://dev.to/api/users/by_username?url=devteam',
      'https://dev.to/api/organizations/devteam'
    ]
  )
})

test('devto returns undefined for a user with the default placeholder', async t => {
  const got = createGot({
    'https://dev.to/api/users/by_username?url=gokulkakde': {
      statusCode: 200,
      body: { username: 'gokulkakde', profile_image: PLACEHOLDER_PROFILE_IMAGE }
    }
  })

  const devto = createDevto({ constants, got })

  t.is(await devto('gokulkakde'), undefined)
})

test('devto returns undefined when neither user nor organization exist', async t => {
  const got = createGot({})

  const devto = createDevto({ constants, got })

  t.is(await devto('thisuserdoesnotexist-xyz-12345'), undefined)
  t.is(got.calls.length, 2)
})
