'use strict'

const { default: test } = require('ava')

const { getAvatarUrl, getAvatar } = require('../../../src/providers/note')

const createNote = got => require('../../../src/providers/note')({ got })

const PROFILE_IMAGE_URL =
  'https://assets.st-note.com/production/uploads/images/93752369/profile_ae0f62081ec839762d6e066ef222a3d6.png?fit=bounds&format=jpeg&quality=85&width=330'

const DEFAULT_PROFILE_IMAGE_URL =
  'https://d2l930y2yx77uc.cloudfront.net/assets/default/default_profile_5-043439195e40e86fd7641a3a1daf982637d77ec6f14b67d3fc98ab92374404ac.png'

test('.getAvatarUrl builds encoded creator API URL', t => {
  t.is(getAvatarUrl('info'), 'https://note.com/api/v2/creators/info')
  t.is(getAvatarUrl('a/b'), 'https://note.com/api/v2/creators/a%2Fb')
})

test('.getAvatar returns profileImageUrl as served', t => {
  t.is(
    getAvatar({ data: { profileImageUrl: PROFILE_IMAGE_URL } }),
    PROFILE_IMAGE_URL
  )
})

test('.getAvatar treats the default profile image as a miss', t => {
  t.is(
    getAvatar({ data: { profileImageUrl: DEFAULT_PROFILE_IMAGE_URL } }),
    undefined
  )
})

test('.getAvatar returns undefined for empty or malformed payloads', t => {
  t.is(getAvatar(undefined), undefined)
  t.is(getAvatar({ data: 'リソースが見つかりません' }), undefined)
  t.is(getAvatar({ data: { profileImageUrl: null } }), undefined)
  t.is(getAvatar({ data: { profileImageUrl: '' } }), undefined)
})

test('note resolves the creator profile image', async t => {
  const note = createNote(async (url, opts) => {
    t.is(url, 'https://note.com/api/v2/creators/info')
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)
    return {
      statusCode: 200,
      body: { data: { profileImageUrl: PROFILE_IMAGE_URL } }
    }
  })

  t.is(await note('info'), PROFILE_IMAGE_URL)
})

test('note returns undefined when the creator uses the default image', async t => {
  const note = createNote(async () => ({
    statusCode: 200,
    body: { data: { profileImageUrl: DEFAULT_PROFILE_IMAGE_URL } }
  }))

  t.is(await note('toi_likes'), undefined)
})

test('note returns undefined when the creator is missing', async t => {
  const note = createNote(async () => ({
    statusCode: 404,
    body: { data: 'リソースが見つかりません' }
  }))

  t.is(await note('missing'), undefined)
})
