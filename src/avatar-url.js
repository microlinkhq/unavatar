'use strict'

const isAbsoluteUrl = require('is-absolute-url')
const memoizeOne = require('memoize-one')
const isUrlHttp = require('is-url-http')
const { get, isNil } = require('lodash')
const isEmail = require('is-email-like')
const pTimeout = require('p-timeout')
const urlRegex = require('url-regex')
const aigle = require('aigle')
const Keyv = require('keyv')
const got = require('got')

const { cacheTTL, cacheURI, avatarTimeout } = require('./constant')
const { providers, providersBy } = require('./providers')
const send = require('./send')

const cache = new Keyv(cacheURI, { TTL: cacheTTL })

const getDefaultFallbackUrl = memoizeOne(
  req => `${req.protocol}://${req.get('host')}/fallback.png`
)

const getFallbackUrl = memoizeOne(req => {
  const fallbackUrl = get(req, 'query.fallback')
  return isUrlHttp(fallbackUrl) && isAbsoluteUrl(fallbackUrl)
    ? fallbackUrl
    : getDefaultFallbackUrl(req)
})

const is = str => {
  if (isEmail(str)) return 'email'
  if (urlRegex({ strict: false }).test(str)) return 'domain'
  return 'username'
}

const getAvatarUrl = key => {
  const collection = get(providersBy, is(key))

  return aigle
    .resolve(collection)
    .reduce(async (acc, provider) => {
      try {
        const urlFn = get(providers, provider)
        const url = await pTimeout(urlFn(key), avatarTimeout)
        if (isAbsoluteUrl(url)) acc.push(url)
      } catch (err) {}

      return acc
    }, [])
    .find(url => got.head(url))
}

module.exports = (fn = getAvatarUrl) => async (req, res) => {
  const cachedData = await cache.get(req.url)
  if (!isNil(cachedData)) return send({ req, res, ...cachedData })

  const username = get(req, 'params.key')
  const fallbackUrl = getFallbackUrl(req)
  let url = null

  try {
    url = await pTimeout(fn(username, fallbackUrl), avatarTimeout)
  } catch (err) {
    console.log('err', err)
    url = fallbackUrl
  }

  const data = {
    url,
    isJSON: !isNil(get(req, 'query.json')),
    isError: isNil(url)
  }
  send({ req, res, ...data })
  cache.set(req.url, data)
}
