'use strict'

const createPingUrl = require('@microlink/ping-url')

module.exports = ({ got, pingCache }) => {
  const pingUrl = createPingUrl(pingCache, {
    value: ({ url, statusCode }) => ({ url, statusCode })
  })

  const reachableUrl = (url, opts) =>
    pingUrl(url, {
      ...got.gotOpts,
      ...opts
    })

  reachableUrl.isReachable = createPingUrl.isReachable

  return reachableUrl
}
