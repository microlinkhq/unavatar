'use strict'

const test = require('ava')

const {
  getAvatar,
  getGroupAvatarUrl,
  getUserAvatarUrl
} = require('../../../src/providers/gitlab')

const createGitLab = got => require('../../../src/providers/gitlab')({ got })

const userAvatarUrl =
  'https://gitlab.com/uploads/-/system/user/avatar/493584/avatar.png'
const groupAvatarUrl =
  'https://gitlab.com/uploads/-/system/group/avatar/9970/project_avatar.png'

test('.getUserAvatarUrl builds the users API URL', t => {
  t.is(
    getUserAvatarUrl('kikobeats'),
    'https://gitlab.com/api/v4/users?username=kikobeats'
  )
})

test('.getGroupAvatarUrl builds the groups API URL', t => {
  t.is(
    getGroupAvatarUrl('gitlab-org'),
    'https://gitlab.com/api/v4/groups/gitlab-org'
  )
})

test('.getAvatar returns avatar_url from a user list', t => {
  t.is(getAvatar([{ avatar_url: userAvatarUrl }]), userAvatarUrl)
})

test('.getAvatar returns avatar_url from a group', t => {
  t.is(getAvatar({ avatar_url: groupAvatarUrl }), groupAvatarUrl)
})

test('.getAvatar treats a missing or empty avatar_url as a miss', t => {
  t.is(getAvatar([]), undefined)
  t.is(getAvatar({}), undefined)
  t.is(getAvatar({ avatar_url: '' }), undefined)
})

test('gitlab resolves the avatar from the users API', async t => {
  const gitlab = createGitLab(async (url, opts) => {
    t.is(url, 'https://gitlab.com/api/v4/users?username=kikobeats')
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    return { statusCode: 200, body: [{ avatar_url: userAvatarUrl }] }
  })

  t.is(await gitlab('kikobeats'), userAvatarUrl)
})

test('gitlab falls back to the groups API', async t => {
  let calls = 0
  const gitlab = createGitLab(async url => {
    calls += 1
    if (url.includes('/users?')) {
      return { statusCode: 200, body: [] }
    }
    t.is(url, 'https://gitlab.com/api/v4/groups/inkscape')
    return { statusCode: 200, body: { avatar_url: groupAvatarUrl } }
  })

  t.is(await gitlab('inkscape'), groupAvatarUrl)
  t.is(calls, 2)
})

test('gitlab returns undefined when user and group are missing', async t => {
  const gitlab = createGitLab(async url => {
    if (url.includes('/users?')) return { statusCode: 200, body: [] }
    return { statusCode: 404, body: { message: '404 Group Not Found' } }
  })

  t.is(await gitlab('missing'), undefined)
})
