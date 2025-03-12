'use strict'

const PCancelable = require('p-cancelable')

const getHTML = require('../util/html-get')

module.exports = PCancelable.fn(async function dribbble ({ input }, onCancel) {
  const promise = getHTML(`https://dribbble.com/${input}`)
  onCancel(() => promise.onCancel())
  const { $ } = await promise
  return $('.profile-avatar').attr('src')
})

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
