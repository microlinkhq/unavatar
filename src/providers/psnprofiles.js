'use strict'

const getAvatar = ({ $, getOgImage, NOT_FOUND }) => {
  const ogImage = getOgImage($)
  return ogImage === undefined ? NOT_FOUND : ogImage
}

module.exports = ({ createHtmlProvider, getOgImage, NOT_FOUND }) =>
  createHtmlProvider({
    name: 'psnprofiles',
    url: input => `https://psnprofiles.com/${input}`,
    getter: $ => getAvatar({ $, getOgImage, NOT_FOUND })
  })

module.exports.getAvatar = getAvatar
