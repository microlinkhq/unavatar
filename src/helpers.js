'use strict'

const isEmail = require('is-email-like')
const urlRegex = require('url-regex')
const aigle = require('aigle')
const Keyv = require('keyv')
const got = require('got')

const { services, servicesBy } = require('./services')
const { cacheTTL, cacheURI } = require('./constant')
const send = require('./send')

const cache = new Keyv(cacheURI, { TTL: cacheTTL })

const is = str => {
  if (isEmail(str)) return 'email'
  if (urlRegex({ strict: false }).test(str)) return 'domain'
  return 'username'
}

const getAvatarUrl = key => {
  const collection = servicesBy[is(key)]
  return aigle
    .resolve(collection)
    .map(service => services[service](key))
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
  let url = null

  try {
    url = await urlFn(key)
  } catch (err) {}

  send({ url, req, res, isJSON, isError: url === null })
  cache.set(req.url, url)
}

module.exports = {
  getAvatarUrl,
  createGetAvatarUrl
}
