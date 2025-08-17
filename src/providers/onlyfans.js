'use strict'

const PCancelable = require('p-cancelable')
const { get } = require('lodash')

const getHTML = require('../util/html-get')

module.exports = PCancelable.fn(async function onlyfans ({ input }, onCancel) {
  const promise = getHTML(`https://onlyfans.com/${input}`, {
    prerender: true,
    puppeteerOpts: { abortTypes: ['other', 'image', 'font'] }
  })
  onCancel(() => promise.onCancel())
  const { $ } = await promise

  const text = $('script[type="application/ld+json"]').contents().text()
  if (!text) return
  return get(JSON.parse(text), 'mainEntity.image')
})

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
