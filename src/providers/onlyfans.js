'use strict'

const { get } = require('lodash')

const getAvatarUrl = $ => {
  const text = $('script[type="application/ld+json"]').contents().text()
  return text ? get(JSON.parse(text), 'mainEntity.image') : undefined
}

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'onlyfans',
    url: input => `https://onlyfans.com/${input}`,
    getter: getAvatarUrl,
    htmlOpts: () => ({
      prerender: true,
      puppeteerOpts: {
        waitForSelector: '#app',
        abortTypes: ['other', 'image', 'font']
      }
    })
  })

module.exports.getAvatarUrl = getAvatarUrl
