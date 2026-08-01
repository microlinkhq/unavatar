'use strict'

const createPingUrl = require('@microlink/ping-url')

module.exports = ({ got, pingCache }) => {
  const pingUrl = createPingUrl(pingCache, {
    value: ({ url, statusCode }) => ({ url, statusCode })
  })

  const reachableUrl = async (url, opts) => {
    const context = {}
    const response = await pingUrl(url, { ...got.gotOpts, ...opts, context })
    const { reservedAddress } = context
    return reservedAddress ? { ...response, reservedAddress } : response
  }

  reachableUrl.isReachable = createPingUrl.isReachable

  return reachableUrl
}
