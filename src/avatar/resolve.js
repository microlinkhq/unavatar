'use strict'

const { omit, eq, get, isNil } = require('lodash')
const debug = require('debug-logfmt')('unavatar')
const isAbsoluteUrl = require('is-absolute-url')
const reachableUrl = require('reachable-url')
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

  const { statusCode, url: resourceUrl } = await reachableUrl(proxyUrl, gotOpts)
  const optimizedUrl = isReachable({ statusCode }) ? resourceUrl : url
  return optimizedUrl
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

  let { value, reason, isRejected } = await pReflect(
    pTimeout(fn(input, req, res), AVATAR_TIMEOUT)
  )

  if (isRejected) {
    debug.error((reason.message || reason).trim())
  }

  if (value && value.type === 'url') {
    value.data = await optimizeUrl(value.data, query)
  }

  if (value === undefined) {
    value = { type: 'url', data: getFallbackUrl({ query, protocol, host }) }
  }

  return {
    ...value,
    isJSON: !isNil(get(req, 'query.json')),
    isError: isNil(value)
  }
}
