'use strict'

const log = require('debug-logfmt')('unavatar:resolve')
const { omit, eq, get, isNil } = require('lodash')
const debug = require('debug-logfmt')('unavatar')
const isAbsoluteUrl = require('is-absolute-url')
const reachableUrl = require('reachable-url')
const beautyError = require('beauty-error')
const memoizeOne = require('memoize-one')
const isUrlHttp = require('is-url-http')
const pTimeout = require('p-timeout')
const pReflect = require('p-reflect')

const { gotOpts } = require('../util/got')
const { isReachable } = reachableUrl

const { AVATAR_SIZE, AVATAR_TIMEOUT } = require('../constant')

const optimizeUrl = async (url, query) => {
  const proxyUrl = `https://images.weserv.nl/?${new URLSearchParams({
    url,
    l: 9,
    af: '',
    il: '',
    n: -1,
    w: AVATAR_SIZE,
    ...omit(query, ['json', 'fallback'])
  }).toString()}`

  log('optimizeUrl', { ping: proxyUrl })
  const { statusCode, url: resourceUrl } = await reachableUrl(proxyUrl, gotOpts)
  log('optimizeUrl', { url, optimizeUrl, statusCode, resourceUrl })
  return isReachable({ statusCode }) ? resourceUrl : url
}

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

module.exports = fn => async (req, res) => {
  const { query, protocol } = req
  const host = req.get('host')
  const input = get(req, 'params.key')

  const { value, reason, isRejected } = await pReflect(
    pTimeout(fn(input, req, res), AVATAR_TIMEOUT)
  )
  const url = value || getFallbackUrl({ query, protocol, host })

  if (isRejected) {
    Array.from(reason).forEach(error => debug.error(beautyError(error.message || error)))
  }

  return {
    url: await optimizeUrl(url, query),
    isJSON: !isNil(get(req, 'query.json')),
    isError: isNil(url)
  }
}
