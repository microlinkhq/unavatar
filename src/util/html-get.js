'use strict'

module.exports = ({ createBrowser, got }) =>
  async function (url, { puppeteerOpts, timeout, gotOpts, ...opts } = {}) {
    const browser = await createBrowser()
    const browserContext = await browser.createContext()

    const promise = require('html-get')(url, {
      prerender: false,
      ...opts,
      getBrowserless: () => browserContext,
      serializeHtml: $ => ({ $ }),
      puppeteerOpts: {
        timeout,
        ...puppeteerOpts
      },
      gotOpts: {
        timeout,
        ...got.gotOpts,
        ...gotOpts
      }
    })

    return Promise.resolve(promise).finally(() => browserContext.destroyContext())
  }
