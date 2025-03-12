'use strict'

const PCancelable = require('p-cancelable')

const getHTML = require('../util/html-get')

module.exports = PCancelable.fn(async function youtube ({ input }, onCancel) {
  const promise = getHTML(`https://www.youtube.com/@${input}`)
  onCancel(() => promise.onCancel())
  const { $ } = await promise
  return $('meta[property="og:image"]').attr('content')
})

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
