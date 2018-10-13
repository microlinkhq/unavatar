'use strict'

const isAbsoluteUrl = require('is-absolute-url')
const isEmail = require('is-email-like')
const pTimeout = require('p-timeout')
const urlRegex = require('url-regex')
const aigle = require('aigle')
const Keyv = require('keyv')
const got = require('got')

const { cacheTTL, cacheURI, avatarTimeout } = require('./constant')
const { services, servicesBy } = require('./services')
const send = require('./send')

const cache = new Keyv(cacheURI, { TTL: cacheTTL })

let fallbackAvatar

const getFallbackAvatar = req => {
  if (fallbackAvatar) return fallbackAvatar
  fallbackAvatar = `${req.protocol}://${req.get('host')}/fallback.png`
  return fallbackAvatar
}

const is = str => {
  if (isEmail(str)) return 'email'
  if (urlRegex({ strict: false }).test(str)) return 'domain'
  return 'username'
}

const getAvatarUrl = key => {
  const collection = servicesBy[is(key)]

  return aigle
    .resolve(collection)
    .reduce(async (acc, service) => {
      try {
        const urlFn = services[service]
        const url = await pTimeout(urlFn(key), avatarTimeout)
        if (isAbsoluteUrl(url)) acc.push(url)
      } catch (err) {}

      return acc
    }, [])
    .find(url => got.head(url))
}

const createGetAvatarUrl = ({
  urlFn = getAvatarUrl,
  isJSON = false
} = {}) => async (req, res) => {
  const cachedUrl = await cache.get(req.url)

  if (cachedUrl) {
    return send({
      url: cachedUrl,
      req,
      res,
      isJSON,
      isError: cachedUrl === null
    })
  }

  const { key } = req.params
  const { fallback } = req.query
  let url = null

  try {
    url = await pTimeout(urlFn(key, fallback), avatarTimeout)
  } catch (err) {}

  if (!url) {
    url = isAbsoluteUrl(fallback)
      ? isAbsoluteUrl(fallback)
      : getFallbackAvatar(req)
  }

  send({ url, req, res, isJSON, isError: url === null })
  cache.set(req.url, url)
}

module.exports = {
  getAvatarUrl,
  createGetAvatarUrl
}
