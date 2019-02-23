'use strict'

const { eq, get, isNil, compact } = require('lodash')
const isAbsoluteUrl = require('is-absolute-url')
const reachableUrl = require('reachable-url')
const beautyError = require('beauty-error')
const debug = require('debug')('unavatar')
const memoizeOne = require('memoize-one')
const isUrlHttp = require('is-url-http')
const isEmail = require('is-email-like')
const pTimeout = require('p-timeout')
const urlRegex = require('url-regex')
const pAny = require('p-any')
const pMap = require('p-map')

const { AVATAR_TIMEOUT } = require('./constant')
const { providers, providersBy } = require('./providers')
const send = require('./send')

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
  return pAny(urls.map(async url => (await reachableUrl(url)).url))
}

module.exports = (fn = getAvatarUrl) => async (req, res) => {
  const { query, protocol } = req
  const host = req.get('host')
  const username = get(req, 'params.key')
  const fallbackUrl = getFallbackUrl({ query, protocol, host })
  let url = null

  try {
    url = await pTimeout(fn(username, fallbackUrl), AVATAR_TIMEOUT)
  } catch (err) {
    debug(beautyError(err))
    url = fallbackUrl
  }

  const data = {
    url,
    isJSON: !isNil(get(req, 'query.json')),
    isError: isNil(url)
  }

  send({ req, res, ...data })
}
