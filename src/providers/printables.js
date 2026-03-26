'use strict'

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'printables',
    url: input =>
      `https://www.printables.com/${
        input.startsWith('@') ? input : `@${input}`
      }`,
    getter: getOgImage
  })
