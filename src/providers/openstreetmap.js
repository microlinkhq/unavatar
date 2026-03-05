'use strict'

const OPENSTREETMAP_USER_ID_REGEX = /^\d+$/

module.exports = ({ got, createHtmlProvider }) => {
  const fromID = userId =>
    got(`https://api.openstreetmap.org/api/0.6/user/${userId}.json`, {
      responseType: 'json'
    }).then(({ body }) => body?.user?.img?.href)

  const fromUsername = createHtmlProvider({
    name: 'openstreetmap',
    url: username => `https://www.openstreetmap.org/user/${encodeURIComponent(username)}`,
    getter: $ => $('img.user_image').attr('src')
  })

  return function openstreetmap ({ input }) {
    return OPENSTREETMAP_USER_ID_REGEX.test(input) ? fromID(input) : fromUsername(...arguments)
  }
}
