'use strict'

const { get } = require('lodash')

const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i
const DEFAULT_AVATAR_MARKER = 'gumroad-default-avatar'

const parseInput = input =>
  typeof input === 'string' && SUBDOMAIN_REGEX.test(input)
    ? input.toLowerCase()
    : undefined

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

  provider.getUrl = getAvatarUrl
  return provider
}

module.exports.parseInput = parseInput
module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
