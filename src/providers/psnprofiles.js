'use strict'

const getAvatarUrl = ({ $, getOgImage, NOT_FOUND }) => {
  const ogImage = getOgImage($)
  return ogImage === undefined ? NOT_FOUND : ogImage
}

module.exports = ({ createHtmlProvider, getOgImage, NOT_FOUND }) =>
  createHtmlProvider({
    name: 'psnprofiles',
    url: input => `https://psnprofiles.com/${input}`,
    getter: ({ $ }) => getAvatarUrl({ $, getOgImage, NOT_FOUND })
  })

module.exports.getAvatarUrl = getAvatarUrl
