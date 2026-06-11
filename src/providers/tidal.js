'use strict'

// Real artwork is served from resources.tidal.com. When an entity has no
// artwork the page keeps a generic share image (tidal.com/img/FB_…), so
// anything off the resources host is treated as a miss.
const isArtwork = url => /^https:\/\/resources\.tidal\.com\//.test(url)

const getAvatarUrl = input => {
  const [first, second] = input.split(':')
  const type = second ? first : 'artist'
  const id = second ?? first
  return `https://tidal.com/${type}/${id}`
}

// The static markup only ships the generic share image; the entity artwork is
// injected into og:image once the SPA hydrates, so the page must be prerendered.
const getAvatar = ({ $, getOgImage, NOT_FOUND }) => {
  const image = getOgImage($)
  return image && isArtwork(image) ? image : NOT_FOUND
}

const factory = ({ createHtmlProvider, getOgImage, NOT_FOUND }) =>
  createHtmlProvider({
    name: 'tidal',
    url: getAvatarUrl,
    getter: $ => getAvatar({ $, getOgImage, NOT_FOUND }),
    htmlOpts: () => ({
      prerender: true
    })
  })

factory.getAvatarUrl = getAvatarUrl
factory.getAvatar = getAvatar

module.exports = factory
