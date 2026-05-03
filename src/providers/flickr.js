'use strict'

const BUDDY_ICON_URL_PATTERN =
  /(?:https?:)?\/\/[^"'()\s]*\/buddyicons\/[^"'()\s]+/i
const CSS_URL_PATTERN = /url\((['"]?)([^)'"]+)\1\)/i
const unescapePathSlashes = value => value?.replace(/\\\//g, '/')

const parseInput = input => {
  const [first, second] = input.split(':')
  return {
    type: second ? first : 'user',
    id: second ?? first
  }
}

const getBuddyIconFromText = value => {
  const normalizedValue = unescapePathSlashes(value)
  if (typeof normalizedValue !== 'string') return
  return normalizedValue.match(BUDDY_ICON_URL_PATTERN)?.[0]
}

const getUserProfileUrl = userId => `https://www.flickr.com/photos/${userId}/`
const getGroupProfileUrl = groupId =>
  `https://www.flickr.com/groups/${groupId}/`

const getAvatarUrl = input => {
  const { type, id } = parseInput(input)

  switch (type) {
    case 'user':
    case 'photos':
      return getUserProfileUrl(id)
    case 'group':
    case 'groups':
      return getGroupProfileUrl(id)
    default:
      throw new Error(`Unsupported Flickr type: ${type}`)
  }
}

const getBuddyIconFromCss = value => {
  const cssUrl = value?.match(CSS_URL_PATTERN)?.[2]
  return getBuddyIconFromText(cssUrl)
}

const getAvatar = $ => {
  const imgBuddyIcon = $('img[src*="/buddyicons/"]').first().attr('src')
  if (imgBuddyIcon) return imgBuddyIcon

  const buddyIconFromStyle = getBuddyIconFromCss(
    $('[style*="buddyicons/"]').first().attr('style')
  )
  if (buddyIconFromStyle) return buddyIconFromStyle

  return getBuddyIconFromText($.html())
}

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'flickr',
    url: getAvatarUrl,
    getter: getAvatar
  })

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
