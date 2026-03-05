'use strict'

const uniqueRandomArray = require('unique-random-array')

/**
 * SoundCloud is serving an old app for desktop users,
 * so we need to use a mobile user agent to get the avatar.
 */
const randomUserAgent = uniqueRandomArray(require('top-user-agents/mobile'))

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'soundcloud',
    url: input => `https://soundcloud.com/${input}`,
    getter: getOgImage,
    htmlOpts: () => ({ headers: { 'user-agent': randomUserAgent() } })
  })
