'use strict'

const { omit, eq, get, isNil } = require('lodash')
const debug = require('debug-logfmt')('unavatar')
const isAbsoluteUrl = require('is-absolute-url')
const reachableUrl = require('reachable-url')
const beautyError = require('beauty-error')
const { URLSearchParams } = require('url')
const memoizeOne = require('memoize-one')
const isUrlHttp = require('is-url-http')
const isEmail = require('is-email-like')
const pTimeout = require('p-timeout')
const urlRegex = require('url-regex')
const pReflect = require('p-reflect')
const pAny = require('p-any')

const { isReachable } = reachableUrl

const { AVATAR_SIZE, AVATAR_TIMEOUT } = require('./constant')
const { providers, providersBy } = require('./providers')

const proxyImageUrl = (url, query) =>
  `https://images.weserv.nl/?${new URLSearchParams({
    url,
    l: 9,
    af: '',
    il: '',
    n: -1,
    w: AVATAR_SIZE,
    ...omit(query, ['json', 'fallback'])
  }).toString()}`

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

const is = input => {
  if (isEmail(input)) return 'email'
  if (urlRegex({ strict: false }).test(input)) return 'domain'
  return 'username'
}

const getAvatarUrl = async (fn, input) => {
  const avatarUrl = await fn(input)
  if (!isAbsoluteUrl(avatarUrl)) throw new Error('Avatar URL is not valid.')
  const { statusCode, url } = await reachableUrl(avatarUrl)
  if (!isReachable({ statusCode })) throw new Error('Avatar URL is not reachable.')
  return url
}

const getFirstReachableAvatarUrl = async input => {
  const collection = get(providersBy, is(input))
  const promises = collection.map(providerName =>
    pTimeout(getAvatarUrl(get(providers, providerName), input), AVATAR_TIMEOUT)
  )
  return pAny(promises)
}

module.exports = (fn = getFirstReachableAvatarUrl) => async (req, res) => {
  const { query, protocol } = req
  const host = req.get('host')
  const input = get(req, 'params.key')

  const { value, reason, isRejected } = await pReflect(
    pTimeout(fn(input, req, res), AVATAR_TIMEOUT)
  )

  const url = value || getFallbackUrl({ query, protocol, host })
  if (isRejected) debug(beautyError(reason))

  return {
    url: proxyImageUrl(url, query),
    isJSON: !isNil(get(req, 'query.json')),
    isError: isNil(url)
  }
}
