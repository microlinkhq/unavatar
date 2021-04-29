'use strict'

const { eq, get, isNil, compact } = require('lodash')
const debug = require('debug-logfmt')('unavatar')
const isAbsoluteUrl = require('is-absolute-url')
const reachableUrl = require('reachable-url')
const beautyError = require('beauty-error')
const memoizeOne = require('memoize-one')
const isUrlHttp = require('is-url-http')
const isEmail = require('is-email-like')
const pTimeout = require('p-timeout')
const urlRegex = require('url-regex')
const pReflect = require('p-reflect')
const pAny = require('p-any')
const pMap = require('p-map')

const { isReachable } = reachableUrl

const { providers, providersBy } = require('./providers')
const { AVATAR_TIMEOUT } = require('./constant')

const getDefaultFallbackUrl = memoizeOne(
  ({ protocol, host }) => `${protocol}://${host}/fallback.png`
)

const getFallbackUrl = memoizeOne(({ query, protocol, host }) => {
  const fallbackUrl = get(query, 'fallback')
  if (eq(fallbackUrl, 'false')) return null

  return isUrlHttp(fallbackUrl) && isAbsoluteUrl(fallbackUrl)
    ? fallbackUrl
    : getDefaultFallbackUrl({ protocol, host })
})

const is = str => {
  if (isEmail(str)) return 'email'
  if (urlRegex({ strict: false }).test(str)) return 'domain'
  return 'username'
}

const getAvatarUrl = async key => {
  const collection = get(providersBy, is(key))

  // get all the urls from the providers that can resolve the key
  const urls = compact(
    await pMap(collection, async provider => {
      try {
        const urlFn = get(providers, provider)
        const url = await pTimeout(urlFn(key), AVATAR_TIMEOUT)
        return isAbsoluteUrl(url) ? url : null
      } catch (err) {
        return null
      }
    })
  )

  // get the first request in resolve the ping successfully
  const avatarUrl = await pAny(
    urls.map(async targetUrl => {
      const { statusCode, url } = await reachableUrl(targetUrl)
      return isReachable({ statusCode }) ? url : undefined
    })
  )

  return avatarUrl
}

module.exports = (fn = getAvatarUrl) => async (req, res) => {
  const { query, protocol } = req
  const host = req.get('host')
  const username = get(req, 'params.key')

  const { value, reason, isRejected } = await pReflect(pTimeout(fn(username), AVATAR_TIMEOUT))

  const url = value || getFallbackUrl({ query, protocol, host })
  if (isRejected) debug(beautyError(reason))

  return {
    url,
    isJSON: !isNil(get(req, 'query.json')),
    isError: isNil(url)
  }
}
