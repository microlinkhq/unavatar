'use strict'

const { $jsonld } = require('@metascraper/helpers')
const { parse: parseSrcset } = require('srcset')

const parseInput = require('../util/parse-subdomain')

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

const getAvatarUrl = input => `https://${input}.substack.com`

module.exports = ({ createHtmlProvider }) => {
  const htmlProvider = createHtmlProvider({
    name: 'substack',
    url: getAvatarUrl,
    getter: getAvatar
  })

  const provider = (input, context) => {
    const publication = parseInput(input)
    return publication ? htmlProvider(publication, context) : undefined
  }

  provider.getUrl = input => {
    const subdomain = parseInput(input)
    return subdomain ? getAvatarUrl(subdomain) : undefined
  }
  return provider
}

module.exports.parseInput = parseInput
module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
