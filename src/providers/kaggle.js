'use strict'

const THUMBNAIL_URL_PREFIX =
  'https://storage.googleapis.com/kaggle-avatars/thumbnails/'
const FULL_SIZE_URL_PREFIX =
  'https://storage.googleapis.com/kaggle-avatars/images/'
const DEFAULT_AVATAR_FILENAME = 'default-thumb.png'
const UNCHALLENGED_CRAWLER_USER_AGENT =
  'Googlebot/2.1 (+http://www.google.com/bot.html)'

const getAvatarUrl = input => `https://www.kaggle.com/${input}`

const getAvatar = ({ $, NOT_FOUND }) => {
  const src =
    $('meta[name="twitter:image"]').attr('content') ||
    $('meta[property="twitter:image"]').attr('content')
  if (!src) return

  if (!src.startsWith(THUMBNAIL_URL_PREFIX)) return NOT_FOUND

  const filename = src.slice(THUMBNAIL_URL_PREFIX.length)
  if (filename === DEFAULT_AVATAR_FILENAME) return NOT_FOUND

  return FULL_SIZE_URL_PREFIX + filename
}

module.exports = ({ createHtmlProvider, NOT_FOUND }) =>
  createHtmlProvider({
    name: 'kaggle',
    url: getAvatarUrl,
    getter: $ => getAvatar({ $, NOT_FOUND }),
    htmlOpts: () => ({
      headers: { 'user-agent': UNCHALLENGED_CRAWLER_USER_AGENT }
    })
  })

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
