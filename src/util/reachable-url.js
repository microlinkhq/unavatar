'use strict'

const createPingUrl = require('@microlink/ping-url')
const ms = require('ms')

const REFUSED_PING_TTL = ms('5m')

const REFUSAL_STATUS_CODES = new Set([403, 408, 429])

const isRedirectStatus = statusCode => statusCode >= 300 && statusCode < 400

const isRefusal = statusCode =>
  REFUSAL_STATUS_CODES.has(statusCode) || statusCode >= 500

const pingTtl = ({ statusCode }) =>
  isRefusal(statusCode) ? REFUSED_PING_TTL : undefined

module.exports = ({ got, pingCache }) => {
  const pingUrl = createPingUrl(pingCache, {
    value: ({ url, statusCode }) => ({ url, statusCode }),
    ttl: pingTtl
  })

  const reachableUrl = async (url, opts) => {
    const context = {}
    const response = await pingUrl(url, { ...got.gotOpts, ...opts, context })
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

  reachableUrl.isReachable = createPingUrl.isReachable

  return reachableUrl
}
