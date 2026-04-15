'use strict'

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'psnprofiles',
    url: input => `https://psnprofiles.com/${input}`,
    getter: getOgImage
  })
