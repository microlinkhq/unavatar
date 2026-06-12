'use strict'

const test = require('ava')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/juejin')

const createJuejin = got => require('../../../src/providers/juejin')({ got })

const avatarUrl =
  'https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/mirror-assets/168e0858b6ccfd57fe5~tplv-t2oaga2asx-image.image'

test('.getAvatarUrl builds the user API URL', t => {
  t.is(
    getAvatarUrl('1556564194374926'),
    'https://api.juejin.cn/user_api/v1/user/get?user_id=1556564194374926'
  )
})

test('.getAvatar returns the avatar_large URL', t => {
  const body = { err_no: 0, data: { avatar_large: avatarUrl } }
  t.is(getAvatar(body), avatarUrl)
})

test('.getAvatar treats an empty profile as a miss', t => {
  const body = { err_no: 0, data: { user_id: '0', avatar_large: '' } }
  t.is(getAvatar(body), undefined)
})

test('.getAvatar treats API errors as a miss', t => {
  t.is(getAvatar({ err_no: 1, err_msg: 'error' }), undefined)
})

test('juejin resolves the avatar from the user API', async t => {
  const juejin = createJuejin(async (url, opts) => {
    t.is(
      url,
      'https://api.juejin.cn/user_api/v1/user/get?user_id=1556564194374926'
    )
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    return {
      statusCode: 200,
      body: { err_no: 0, data: { avatar_large: avatarUrl } }
    }
  })

  t.is(await juejin('1556564194374926'), avatarUrl)
})

test('juejin returns undefined when the user is missing', async t => {
  const juejin = createJuejin(async () => ({
    statusCode: 200,
    body: { err_no: 0, data: { user_id: '0', avatar_large: '' } }
  }))

  t.is(await juejin('1'), undefined)
})
