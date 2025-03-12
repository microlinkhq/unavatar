'use strict'

const PCancelable = require('p-cancelable')

const getHTML = require('../util/html-get')

module.exports = PCancelable.fn(async function telegram ({ input }, onCancel) {
  const promise = getHTML(`https://t.me/${input}`)
  onCancel(() => promise.onCancel())
  const { $ } = await promise
  const el = $('img.tgme_page_photo_image')
  return el.attr('src')
})

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
