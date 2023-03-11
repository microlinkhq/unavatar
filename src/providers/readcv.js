'use strict'

const cheerio = require('cheerio')
const srcset = require('srcset')

const getHTML = require('../util/html-get')

module.exports = async function readcv (username) {
  const { html } = await getHTML(`https://read.cv/${username}`)
  const $ = cheerio.load(html)
  const images = $('main > div > div > div > div > img').attr('srcset')
  if (!images) return
  const parsedImages = srcset.parse(images)
  return parsedImages[parsedImages.length - 1].url
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
