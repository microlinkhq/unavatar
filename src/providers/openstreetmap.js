'use strict'

const OPENSTREETMAP_API_URL = 'https://api.openstreetmap.org/api/0.6/user'

const OPENSTREETMAP_USER_ID_REGEX = /^\d+$/

module.exports = ({ got, createHtmlProvider }) => {
  const fromUsername = createHtmlProvider({
    name: 'openstreetmap',
    url: username =>
      `https://www.openstreetmap.org/user/${encodeURIComponent(username)}`,
    getter: $ => $('img.user_image').attr('src')
  })

  return function openstreetmap (input, context) {
    return OPENSTREETMAP_USER_ID_REGEX.test(input)
      ? got(`${OPENSTREETMAP_API_URL}/${input}.json`, {
        responseType: 'json'
      }).then(({ body }) => body?.user?.img?.href)
      : fromUsername(input, context)
  }
}

module.exports.OPENSTREETMAP_USER_ID_REGEX = OPENSTREETMAP_USER_ID_REGEX
