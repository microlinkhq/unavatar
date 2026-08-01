'use strict'

const uniqueRandomArray = require('unique-random-array')
const tlsHook = require('https-tls/hook')
const uaHints = require('ua-hints')
const got = require('got')

const httpStatus = require('./http-status')

const topUserAgents = require('top-user-agents')
const randomUserAgent = uniqueRandomArray(topUserAgents)

const precomputedUaHints = new Map(
  topUserAgents.map(userAgent => [userAgent, uaHints(userAgent)])
)

const precomputedUaHintEntries = new Map(
  topUserAgents.map(userAgent => [
    userAgent,
    Object.entries(precomputedUaHints.get(userAgent))
  ])
)

const getUaHintEntries = userAgent =>
  precomputedUaHintEntries.get(userAgent) || Object.entries(uaHints(userAgent))

const userAgentHook = options => {
  let userAgent = options.headers['user-agent']
  if (userAgent === 'got (https://github.com/sindresorhus/got)') {
    userAgent = randomUserAgent()
    options.headers['user-agent'] = userAgent
  }

  const uaHintEntries = getUaHintEntries(userAgent)
  for (let index = 0; index < uaHintEntries.length; index++) {
    const [key, value] = uaHintEntries[index]
    options.headers[key] = value
  }
}

module.exports = ({ cacheableLookup, isReservedIp }) => {
  /**
   * A plain Error is wrapped by got into a RequestError that keeps only the
   * message, so the status code has to travel on an error got lets through.
   */
  const reservedAddressHook = async options => {
    const hostname = options.url?.hostname
    if (hostname && (await isReservedIp(hostname))) {
      const error = new got.RequestError(
        `Refusing to request a reserved address: ${hostname}`,
        {},
        options
      )
      error.statusCode = httpStatus.FORBIDDEN
      throw error
    }
  }

  const gotOpts = {
    dnsCache: cacheableLookup,
    https: { rejectUnauthorized: false },
    hooks: {
      beforeRequest: [reservedAddressHook, userAgentHook, tlsHook],
      beforeRedirect: [reservedAddressHook]
    }
  }

  const instance = got.extend(gotOpts)
  instance.gotOpts = gotOpts

  return instance
}
