'use strict'

const { get } = require('lodash')

const getAvatarUrl = $ => {
  const text = $('script[type="application/ld+json"]').contents().text()
  if (!text) return
  return get(JSON.parse(text), 'mainEntity.image')
}

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'onlyfans',
    url: input => `https://onlyfans.com/${input}`,
    getter: getAvatarUrl,
    htmlOpts: () => ({
      prerender: true,
      puppeteerOpts: { waitUntil: 'networkidle2', abortTypes: ['other', 'image', 'font'] }
    })
  })
