'use strict'

const randomCrawlerAgent = require('../util/crawler-agent')

const isBlocked = $ => $('title').text().includes('Login')

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'instagram',
    url: input => `https://www.instagram.com/${input}`,
    getter: $ => !isBlocked($) && getOgImage($),
    htmlOpts: () => ({ headers: { 'user-agent': randomCrawlerAgent() } })
  })
