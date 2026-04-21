'use strict'

const BUDDY_ICON_URL_PATTERN = /(?:https?:)?\/\/[^"'()\s]*\/buddyicons\/[^"'()\s]+/i
const CSS_URL_PATTERN = /url\((['"]?)([^)'"]+)\1\)/i
const unescapePathSlashes = value => value?.replace(/\\\//g, '/')

const getBuddyIconFromText = value => {
  const normalizedValue = unescapePathSlashes(value)
  if (typeof normalizedValue !== 'string') return
  return normalizedValue.match(BUDDY_ICON_URL_PATTERN)?.[0]
}

const getAvatarUrl = input => {
  const [first, second] = input.split(':')
  const type = second ? first : 'user'
  const id = second ?? first

  switch (type) {
    case 'user':
    case 'photos':
      return `https://www.flickr.com/photos/${id}/`
    case 'group':
    case 'groups':
      return `https://www.flickr.com/groups/${id}/`
    default:
      throw new Error(`Unsupported Flickr type: ${type}`)
  }
}

const getBuddyIconFromCss = value => {
  const cssUrl = value?.match(CSS_URL_PATTERN)?.[2]
  return getBuddyIconFromText(cssUrl)
}

const getAvatarFromMarkup = $ => {
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
    getter: getAvatarFromMarkup
  })

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatarFromMarkup = getAvatarFromMarkup
