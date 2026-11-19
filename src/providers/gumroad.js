'use strict'

const { get } = require('lodash')

const parseInput = require('../util/parse-subdomain')

const DEFAULT_AVATAR_MARKER = 'gumroad-default-avatar'

const getAvatarUrl = input => `https://${input}.gumroad.com/`

const getAvatar = ({ $, NOT_FOUND }) => {
  const page = $('#app').attr('data-page')
  if (!page) return
  const avatarUrl = get(JSON.parse(page), [
    'props',
    'creator_profile',
    'avatar_url'
  ])
  if (!avatarUrl || avatarUrl.includes(DEFAULT_AVATAR_MARKER)) return NOT_FOUND
  return avatarUrl
}

module.exports = ({ createHtmlProvider, NOT_FOUND }) => {
  const htmlProvider = createHtmlProvider({
    name: 'gumroad',
    url: getAvatarUrl,
    getter: $ => getAvatar({ $, NOT_FOUND })
  })

  const provider = (input, context) => {
    const username = parseInput(input)
    return username ? htmlProvider(username, context) : undefined
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
