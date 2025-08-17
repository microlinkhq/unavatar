'use strict'

const PCancelable = require('p-cancelable')
const { get } = require('lodash')

const getHTML = require('../util/html-get')

module.exports = PCancelable.fn(async function tiktok ({ input }, onCancel) {
  const promise = getHTML(`https://www.tiktok.com/@${input}`)
  onCancel(() => promise.onCancel())
  const { $ } = await promise

  const json = JSON.parse(
    $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').contents().text()
  )
  return get(json, [
    '__DEFAULT_SCOPE__',
    'webapp.user-detail',
    'userInfo',
    'user',
    'avatarLarger'
  ])
})

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
