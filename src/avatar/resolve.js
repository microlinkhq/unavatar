'use strict'

const debug = require('debug-logfmt')('unavatar:resolve')
const reachableUrl = require('../util/reachable-url')
const isAbsoluteUrl = require('is-absolute-url')
const memoizeOne = require('async-memoize-one')
const dataUriRegex = require('data-uri-regex')
const { getTtl } = require('../send/cache')
const isUrlHttp = require('is-url-http')
const pTimeout = require('p-timeout')
const pReflect = require('p-reflect')
const { omit } = require('lodash')

const isIterable = require('../util/is-iterable')

const { AVATAR_SIZE, AVATAR_TIMEOUT } = require('../constant')

const printErrors = error => {
  isIterable.forEach(error, error => {
    if (isIterable(error)) printErrors(error)
    else {
      if (error.message) {
        debug.error({
          name: error.name,
          message: error.message,
          statusCode: error.statusCode
        })
      }
    }
  })
}

const optimizeUrl = async (url, query) => {
  const { ttl, ...rest } = omit(query, ['json', 'fallback'])
  return `https://images.weserv.nl/?${new URLSearchParams({
    url,
    default: url,
    l: 9,
    af: '',
    il: '',
    n: -1,
    w: AVATAR_SIZE,
    ttl: getTtl(ttl),
    ...rest
  }).toString()}`
}

const getDefaultFallbackUrl = ({ protocol, host }) =>
  this.url || (this.url = `${protocol}://${host}/fallback.png`)

const getFallbackUrl = memoizeOne(async ({ query, protocol, host }) => {
  const { fallback } = query
  if (fallback === false) return null
  if (dataUriRegex().test(fallback)) return fallback
  if (!isUrlHttp(fallback) || !isAbsoluteUrl(fallback)) {
    return getDefaultFallbackUrl({ protocol, host })
  }
  const { statusCode, url } = await reachableUrl(fallback)
  return reachableUrl.isReachable({ statusCode })
    ? url
    : getDefaultFallbackUrl({ protocol, host })
})

module.exports = fn => async (req, res) => {
  const protocol = req.socket.encrypted ? 'https' : 'http'
  const input = req.params.key
  const host = req.headers.host
  const { query } = req

  let { value, reason, isRejected } = await pReflect(
    pTimeout(fn({ input, req, res }), AVATAR_TIMEOUT)
  )

  if (isRejected) printErrors(reason)

  if (value && value.type === 'url') {
    value.data = await optimizeUrl(value.data, query)
  }

  if (value === undefined) {
    const data = await getFallbackUrl({ query, protocol, host })
    value = data
      ? { type: dataUriRegex().test(data) ? 'buffer' : 'url', data }
      : null
  }

  return value
}
