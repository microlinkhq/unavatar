'use strict'

const getHTML = require('html-get')

const createBrowser = require('./browserless')
const { gotOpts } = require('./got')

const { AVATAR_TIMEOUT } = require('../constant')

module.exports = async (url, { puppeteerOpts, ...opts } = {}) => {
  const browser = await createBrowser()
  const browserContext = await browser.createContext()

  const result = await getHTML(url, {
    ...opts,
    getBrowserless: () => browserContext,
    puppeteerOpts: {
      ...puppeteerOpts,
      abortTypes: ['image', 'stylesheet', 'font', 'script'],
      timeout: AVATAR_TIMEOUT
    },
    gotOpts: {
      ...gotOpts,
      timeout: AVATAR_TIMEOUT
    }
  })

  await Promise.resolve(browserContext).then(browserless =>
    browserless.destroyContext()
  )

  return result
}
