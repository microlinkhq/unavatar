'use strict'

const test = require('ava')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/gitee')

const createGitee = got => require('../../../src/providers/gitee')({ got })

const avatarUrl =
  'https://foruda.gitee.com/avatar/1676949889394125096/1151004_y_project_1578942802.png'

test('.getAvatarUrl builds the user API URL', t => {
  t.is(getAvatarUrl('y_project'), 'https://gitee.com/api/v5/users/y_project')
})

test('.getAvatar returns the avatar_url', t => {
  t.is(getAvatar({ avatar_url: avatarUrl }), avatarUrl)
})

test('.getAvatar treats an empty avatar_url as a miss', t => {
  t.is(getAvatar({ avatar_url: '' }), undefined)
})

test('gitee resolves the avatar from the user API', async t => {
  const gitee = createGitee(async (url, opts) => {
    t.is(url, 'https://gitee.com/api/v5/users/y_project')
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    return { statusCode: 200, body: { avatar_url: avatarUrl } }
  })

  t.is(await gitee('y_project'), avatarUrl)
})

test('gitee returns undefined when the user is missing', async t => {
  const gitee = createGitee(async () => ({
    statusCode: 404,
    body: { message: '404 Not Found' }
  }))

  t.is(await gitee('missing'), undefined)
})
