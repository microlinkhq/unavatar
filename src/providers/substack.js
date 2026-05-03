'use strict'

const { $jsonld } = require('@metascraper/helpers')
const { parse: parseSrcset } = require('srcset')

const getBestSrcsetUrl = srcset => {
  if (typeof srcset !== 'string' || srcset.trim() === '') return

  const candidates = parseSrcset(srcset).map(candidate => ({
    url: candidate.url,
    score: candidate.width ?? candidate.density ?? 0
  }))

  if (candidates.length === 0) return
  return candidates.reduce((best, current) =>
    current.score > best.score ? current : best
  ).url
}

const getPictureAvatar = $ => {
  const pictureImg = $('picture img')
  const srcset = pictureImg.attr('srcset')
  return getBestSrcsetUrl(srcset) || pictureImg.attr('src')
}

const getAvatar = $ => $jsonld('publisher.logo.url')($) || getPictureAvatar($)

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'substack',
    url: input => `https://${input}.substack.com`,
    getter: getAvatar
  })

module.exports.getAvatar = getAvatar
