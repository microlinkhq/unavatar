'use strict'

const memoize = require('@keyvhq/memoize')
const reachableUrl = require('reachable-url')
const ms = require('ms')

const RATE_LIMITED = 429
const UNCACHED_STATUS_CODES = new Set([403, 408])
const RATE_LIMIT_TTL_DEFAULT = ms('1m')
const RATE_LIMIT_TTL_MIN = ms('1s')
const RATE_LIMIT_TTL_MAX = ms('10m')

const isRedirectStatus = statusCode => statusCode >= 300 && statusCode < 400

const isUncached = statusCode =>
  UNCACHED_STATUS_CODES.has(statusCode) || statusCode >= 500

const parseRetryAfter = (value, now = Date.now()) => {
  if (typeof value === 'string') value = value.trim()
  if (!value) return undefined
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return seconds * 1000
  const date = Date.parse(value)
  if (!Number.isNaN(date)) return date - now
  const first = typeof value === 'string' ? value.split(',')[0].trim() : ''
  if (!first || first === value) return undefined
  const firstSeconds = Number(first)
  return Number.isFinite(firstSeconds) ? firstSeconds * 1000 : undefined
}

const rateLimitTtl = retryAfter => {
  const wait = parseRetryAfter(retryAfter)
  if (wait === undefined) return RATE_LIMIT_TTL_DEFAULT
  return Math.min(Math.max(wait, RATE_LIMIT_TTL_MIN), RATE_LIMIT_TTL_MAX)
}

class UncachedPing extends Error {
  constructor (response) {
    super(`ping not cached for ${response.statusCode}`)
    this.response = response
  }
}

const ping = async (url, opts) => {
  const {
    url: resolvedUrl,
    statusCode,
    headers
  } = await reachableUrl(url, opts)
  const response = { url: resolvedUrl, statusCode }
  if (isUncached(statusCode)) throw new UncachedPing(response)
  if (statusCode === RATE_LIMITED) {
    return { ...response, ttl: rateLimitTtl(headers?.['retry-after']) }
  }
  return response
}

const unwrapUncached = error => {
  if (error instanceof UncachedPing) return error.response
  throw error
}

module.exports = ({ got, pingCache }) => {
  const cachedPing = memoize(ping, pingCache, { ttl: value => value.ttl })

  const pingUrl = async (url, opts) => {
    const context = {}
    const { ttl, ...response } = await cachedPing(url, {
      ...got.gotOpts,
      ...opts,
      context
    }).catch(unwrapUncached)
    const { reservedAddress } = context

    // reachable-url leaves the redirect hop as the status when a beforeRedirect
    // hook aborts, and the ping cache only memoizes {url, statusCode} — so a
    // later hit would replay that hop without the reserved-address refusal.
    const statusCode = isRedirectStatus(response.statusCode)
      ? 404
      : response.statusCode

    if (reservedAddress) return { ...response, statusCode, reservedAddress }
    if (statusCode === response.statusCode) return response
    return { ...response, statusCode }
  }

  pingUrl.isReachable = reachableUrl.isReachable

  return pingUrl
}

module.exports.rateLimitTtl = rateLimitTtl
