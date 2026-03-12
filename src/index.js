'use strict'

const DEFAULTS = require('./constant')

module.exports = ({ constants: userConstants, onFetchHTML } = {}) => {
  const constants = { ...DEFAULTS, ...userConstants }

  if (userConstants?.REQUEST_TIMEOUT && !userConstants?.PROXY_TIMEOUT) {
    constants.PROXY_TIMEOUT = Math.floor(constants.REQUEST_TIMEOUT * (1 / 3))
  }
  if (userConstants?.REQUEST_TIMEOUT && !userConstants?.DNS_TIMEOUT) {
    constants.DNS_TIMEOUT = Math.floor(constants.REQUEST_TIMEOUT * (1 / 5))
  }

  const { createMemoryCache, createRedisCache } = require('./util/keyv')(constants)
  const cacheableLookup = require('./util/cacheable-lookup')({ ...constants, createMemoryCache })
  const got = require('./util/got')({ cacheableLookup })
  const reachableUrl = require('./util/reachable-url')({ got, createMemoryCache })
  const createBrowser = require('./util/browserless')(constants)
  const getHTML = require('./util/html-get')({ createBrowser, got })
  const { createHtmlProvider, getOgImage } = require('./util/html-provider')({
    ...constants,
    getHTML,
    onFetchHTML
  })

  const providerCtx = { constants, createHtmlProvider, getOgImage, got, createRedisCache }
  const { providers, providersBy } = require('./providers')(providerCtx)

  const { auto, getInputType, getAvatar } = require('./avatar/auto')({
    constants,
    providers,
    providersBy,
    reachableUrl
  })

  const normalizeArgs = input =>
    typeof input === 'string' ? { input } : input

  const unavatar = input => auto(normalizeArgs(input))

  Object.keys(providers).forEach(name => {
    unavatar[name] = input => getAvatar(providers[name], name, normalizeArgs(input))
  })

  unavatar.auto = auto
  unavatar.getInputType = getInputType
  unavatar.getAvatar = getAvatar
  unavatar.providers = providers
  unavatar.providersBy = providersBy
  unavatar.reachableUrl = reachableUrl
  unavatar.got = got
  unavatar.createBrowser = createBrowser

  return unavatar
}
