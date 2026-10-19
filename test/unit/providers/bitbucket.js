'use strict'

const { default: test } = require('ava')

const { getAvatarUrl, getAvatar } = require('../../../src/providers/bitbucket')

const createBitbucket = got =>
  require('../../../src/providers/bitbucket')({ got })

const CUSTOM_AVATAR_URL =
  'https://bitbucket-assetroot.s3.amazonaws.com/c/photos/2017/Oct/05/3533056382-3-atlassian-avatar_avatar.png'

const DEFAULT_AVATAR_URL =
  'https://bbc-object-storage--frontbucket.us-east-1.prod.public.atl-paas.net/000eb03325eb/img/default_workspace_avatar/workspace_code.svg'

test('.getAvatarUrl builds the workspace avatar URL', t => {
  t.is(
    getAvatarUrl('atlassian'),
    'https://bitbucket.org/workspaces/atlassian/avatar/'
  )
})

test('.getAvatarUrl encodes workspace UUIDs and unsafe characters', t => {
  t.is(
    getAvatarUrl('{02b941e3-cfaa-40f9-9a58-cec53e20bdc3}'),
    'https://bitbucket.org/workspaces/%7B02b941e3-cfaa-40f9-9a58-cec53e20bdc3%7D/avatar/'
  )
  t.is(getAvatarUrl('a/b'), 'https://bitbucket.org/workspaces/a%2Fb/avatar/')
})

test('.getAvatar returns the redirect target for a custom avatar', t => {
  t.is(getAvatar(CUSTOM_AVATAR_URL), CUSTOM_AVATAR_URL)
})

test('.getAvatar resolves a relative redirect against bitbucket.org', t => {
  t.is(
    getAvatar('/account/atlassian/avatar/128/'),
    'https://bitbucket.org/account/atlassian/avatar/128/'
  )
})

test('.getAvatar treats the default workspace avatar as a miss', t => {
  t.is(getAvatar(DEFAULT_AVATAR_URL), undefined)
})

test('.getAvatar returns undefined without a redirect', t => {
  t.is(getAvatar(undefined), undefined)
})

test('bitbucket resolves the avatar redirect without following it', async t => {
  const bitbucket = createBitbucket(async (url, opts) => {
    t.is(url, 'https://bitbucket.org/workspaces/atlassian/avatar/')
    t.is(opts.method, 'HEAD')
    t.false(opts.followRedirect)
    t.false(opts.throwHttpErrors)

    return { statusCode: 302, headers: { location: CUSTOM_AVATAR_URL } }
  })

  t.is(await bitbucket('atlassian'), CUSTOM_AVATAR_URL)
})

test('bitbucket returns undefined for a workspace using the default avatar', async t => {
  const bitbucket = createBitbucket(async () => ({
    statusCode: 302,
    headers: { location: DEFAULT_AVATAR_URL }
  }))

  t.is(await bitbucket('tutorials'), undefined)
})

test('bitbucket returns undefined when the workspace is missing', async t => {
  const bitbucket = createBitbucket(async () => ({
    statusCode: 404,
    headers: {}
  }))

  t.is(await bitbucket('notarealuserxyz123456789'), undefined)
})
