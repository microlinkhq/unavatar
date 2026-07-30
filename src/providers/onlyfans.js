'use strict'

const { get } = require('lodash')

const getAvatar = $ => {
  const text = $('script[type="application/ld+json"]').contents().text()
  return text ? get(JSON.parse(text), 'mainEntity.image') : undefined
}

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'onlyfans',
    url: input => `https://onlyfans.com/${input}`,
    getter: getAvatar,
    htmlOpts: () => ({
      prerender: true,
      puppeteerOpts: {
        waitForSelector: '#app',
        abortTypes: ['other', 'image', 'font']
      }
    })
  })

module.exports.getAvatar = getAvatar
