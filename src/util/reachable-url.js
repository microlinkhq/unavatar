'use strict'

const memoize = require('@keyvhq/memoize')
const reachableUrl = require('reachable-url')

const REFUSAL_STATUS_CODES = new Set([403, 408, 429])

const isRedirectStatus = statusCode => statusCode >= 300 && statusCode < 400

const isRefusal = statusCode =>
  REFUSAL_STATUS_CODES.has(statusCode) || statusCode >= 500

class RefusedPing extends Error {
  constructor (response) {
    super(`ping refused with ${response.statusCode}`)
    this.response = response
  }
}

const ping = async (url, opts) => {
  const { url: resolvedUrl, statusCode } = await reachableUrl(url, opts)
  const response = { url: resolvedUrl, statusCode }
  if (isRefusal(statusCode)) throw new RefusedPing(response)
  return response
}

const unwrapRefusal = error => {
  if (error instanceof RefusedPing) return error.response
  throw error
}

module.exports = ({ got, pingCache }) => {
  const cachedPing = memoize(ping, pingCache)

  const pingUrl = async (url, opts) => {
    const context = {}
    const response = await cachedPing(url, {
      ...got.gotOpts,
      ...opts,
      context
    }).catch(unwrapRefusal)
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
