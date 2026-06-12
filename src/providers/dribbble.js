'use strict'

const uniqueRandomArray = require('unique-random-array')

/**
 * Dribbble answers 403 to crawler/bot user agents, so a real desktop
 * browser user agent is required to reach the profile markup.
 */
const randomUserAgent = uniqueRandomArray(require('top-user-agents'))

module.exports = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'dribbble',
    url: input => `https://dribbble.com/${input}`,
    getter: $ => $('.profile-avatar').attr('src'),
    htmlOpts: () => ({ headers: { 'user-agent': randomUserAgent() } })
  })
