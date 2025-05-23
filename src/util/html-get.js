'use strict'

const getHTML = require('html-get')

const createBrowser = require('./browserless')
const { gotOpts } = require('./got')

const { AVATAR_TIMEOUT } = require('../constant')

module.exports = async (url, { puppeteerOpts, ...opts } = {}) => {
  const browser = await createBrowser()
  const browserContext = await browser.createContext()

  const result = await getHTML(url, {
    prerender: false,
    ...opts,
    getBrowserless: () => browserContext,
    serializeHtml: $ => ({ $ }),
    puppeteerOpts: {
      timeout: AVATAR_TIMEOUT,
      ...puppeteerOpts
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
