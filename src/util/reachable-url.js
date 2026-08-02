'use strict'

const createPingUrl = require('@microlink/ping-url')

const isRedirectStatus = statusCode =>
  statusCode >= 300 && statusCode < 400

module.exports = ({ got, pingCache }) => {
  const pingUrl = createPingUrl(pingCache, {
    value: ({ url, statusCode }) => ({ url, statusCode })
  })

  const reachableUrl = async (url, opts) => {
    const context = {}
    const response = await pingUrl(url, { ...got.gotOpts, ...opts, context })
    const { reservedAddress } = context

    // A 3xx means redirect following never finished. reachable-url leaves the
    // redirect hop as the status when a beforeRedirect hook aborts — including
    // our reserved-address refusal. The ping cache only stores {url,statusCode},
    // so a later hit would otherwise look like a successful reachable probe and
    // serve the attacker URL (JSON) / skip the reserved refusal.
    const statusCode = isRedirectStatus(response.statusCode)
      ? 404
      : response.statusCode

    return reservedAddress
      ? { ...response, statusCode, reservedAddress }
      : statusCode === response.statusCode
        ? response
        : { ...response, statusCode }
  }

  reachableUrl.isReachable = createPingUrl.isReachable

  return reachableUrl
}
