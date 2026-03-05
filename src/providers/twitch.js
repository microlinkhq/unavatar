'use strict'

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'twitch',
    url: input => `https://www.twitch.tv/${input}`,
    getter: getOgImage
  })
