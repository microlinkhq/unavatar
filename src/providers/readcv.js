'use strict'

const PCancelable = require('p-cancelable')
const srcset = require('srcset')

const getHTML = require('../util/html-get')

module.exports = PCancelable.fn(async function readcv ({ input }, onCancel) {
  const promise = getHTML(`https://read.cv/${input}`)
  onCancel(() => promise.onCancel())
  const { $ } = await promise
  const images = $('main > div > div > div > div > img').attr('srcset')
  if (!images) return
  const parsedImages = srcset.parse(images)
  return parsedImages[parsedImages.length - 1].url
})

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
