'use strict'

const debug = require('debug-logfmt')('unavatar:resolve')
const { omit, eq, get, isNil } = require('lodash')
const isAbsoluteUrl = require('is-absolute-url')
const memoizeOne = require('memoize-one')
const isUrlHttp = require('is-url-http')
const pTimeout = require('p-timeout')
const pReflect = require('p-reflect')

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

  if (isRejected) printErrors(reason)

  if (value && value.type === 'url') {
    value.data = await optimizeUrl(value.data, query)
  }

  if (value === undefined) {
    const data = getFallbackUrl({ query, protocol, host })
    value = data ? { type: 'url', data } : null
  }

  return {
    ...value,
    isJSON: !isNil(query.json),
    isError: isNil(value)
  }
}
