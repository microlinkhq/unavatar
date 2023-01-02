'use strict'

const { omit, eq, get, isNil } = require('lodash')
const debug = require('debug-logfmt')('unavatar')
const isAbsoluteUrl = require('is-absolute-url')
const memoizeOne = require('memoize-one')
const isUrlHttp = require('is-url-http')
const pTimeout = require('p-timeout')
const pReflect = require('p-reflect')

const { AVATAR_SIZE, AVATAR_TIMEOUT } = require('../constant')

const optimizeUrl = async (url, query) =>
  `https://images.weserv.nl/?${new URLSearchParams({
    url,
    default: url,
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

module.exports = fn => async (req, res) => {
  const protocol = req.socket.encrypted ? 'https' : 'http'
  const input = get(req, 'params.key')
  const host = req.headers.host
  const { query } = req

  let { value, reason, isRejected } = await pReflect(
    pTimeout(fn(input, req, res), AVATAR_TIMEOUT)
  )

  if (isRejected) {
    debug.warn((reason.message || reason).trim())
  }

  if (value && value.type === 'url') {
    value.data = await optimizeUrl(value.data, query)
  }

  if (value === undefined) {
    const data = getFallbackUrl({ query, protocol, host })
    value = data ? { type: 'url', data } : null
  }

  return {
    ...value,
    isJSON: !isNil(get(req, 'query.json')),
    isError: isNil(value)
  }
}
