'use strict'

// Entities without artwork keep an empty image hash
// (cdn-images.dzcdn.net/images/artist//500x500.jpg), which resolves to a
// generic placeholder, so any empty hash segment is treated as a miss.
const isArtwork = url => !/\/images\/[^/]+\/\/\d/.test(url)

const getAvatarUrl = input => {
  const [first, second] = input.split(':')
  const type = second ? first : 'artist'
  const id = second ?? first
  return `https://www.deezer.com/en/${type}/${id}`
}

// Deezer server-renders og:image for missing entities as well, so the empty
// placeholder is filtered out and everything else is returned as-is.
const getAvatar = ({ $, getOgImage, NOT_FOUND }) => {
  const image = getOgImage($)
  return image && isArtwork(image) ? image : NOT_FOUND
}

const factory = ({ createHtmlProvider, getOgImage, NOT_FOUND }) =>
  createHtmlProvider({
    name: 'deezer',
    url: getAvatarUrl,
    getter: $ => getAvatar({ $, getOgImage, NOT_FOUND })
  })

factory.getAvatarUrl = getAvatarUrl
factory.getAvatar = getAvatar

module.exports = factory
