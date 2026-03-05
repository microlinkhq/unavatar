'use strict'

const spotifyUri = input => {
  const [first, second] = input.split(':')
  const type = second ? first : 'user'
  const id = second ?? first
  return `${type}/${id}`
}

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'spotify',
    url: input => `https://open.spotify.com/${spotifyUri(input)}`,
    getter: getOgImage,
    htmlOpts: () => ({
      prerender: true
    })
  })
