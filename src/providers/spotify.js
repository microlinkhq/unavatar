'use strict'

const getAvatarUrl = input => {
  const [first, second] = input.split(':')
  const type = second ? first : 'user'
  const id = second ?? first
  return `https://open.spotify.com/${type}/${id}`
}

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'spotify',
    url: getAvatarUrl,
    getter: getOgImage,
    htmlOpts: () => ({
      prerender: true
    })
  })

module.exports.getAvatarUrl = getAvatarUrl
