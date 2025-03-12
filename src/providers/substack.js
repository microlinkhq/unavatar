'use strict'

const PCancelable = require('p-cancelable')

const getHTML = require('../util/html-get')

module.exports = PCancelable.fn(async function substack ({ input }, onCancel) {
  const promise = getHTML(`https://${input}.substack.com`)
  onCancel(() => promise.onCancel())
  const { $ } = await promise
  return $('.publication-logo').attr('src')
})

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
