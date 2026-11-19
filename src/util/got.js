'use strict'

const uniqueRandomArray = require('unique-random-array')
const tlsHook = require('https-tls/hook')
const uaHints = require('ua-hints')
const got = require('got')

const {
  RESERVED_ADDRESS_CODE,
  isReservedAddress,
  literalAddresses
} = require('./is-reserved-ip')
const {
  createSsrfLookup,
  createReservedAddressError
} = require('./ssrf-lookup')

const UNIX_SOCKET_HOSTNAME = 'unix'

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
   * The refused address is reported on `options.context` because a caller
   * reading the outcome through `reachable-url` never sees the rejection: it is
   * swallowed there and served back as a response.
   *
   * Only a context the caller owns is written: the one got defaults to is
   * frozen and shared between requests, so asking to be told is what passing a
   * context means.
   *
   * got replaces the error with a RequestError that keeps the message and the
   * code, so the refusal is named by a code rather than by its type.
   */
  const ssrfLookup = createSsrfLookup(cacheableLookup.lookup)

  const recordReservedAddress = (options, hostname) => {
    if (Object.isExtensible(options.context)) {
      options.context.reservedAddress = hostname
    }
  }

  const refuse = (options, hostname) => {
    recordReservedAddress(options, hostname)
    throw createReservedAddressError(hostname)
  }

  const connectThroughSsrfLookup = (options, hostname) => {
    options.lookup = (name, lookupOptions, callback) => {
      if (typeof lookupOptions === 'function') {
        callback = lookupOptions
        lookupOptions = {}
      }
      ssrfLookup(name, lookupOptions, (error, ...answer) => {
        if (error?.code === RESERVED_ADDRESS_CODE) {
          recordReservedAddress(options, hostname)
        }
        callback(error, ...answer)
      })
    }
  }

  const reservedAddressHook = async options => {
    const hostname = options.url?.hostname
    if (!hostname) return

    if (hostname === UNIX_SOCKET_HOSTNAME) refuse(options, hostname)

    const literals = literalAddresses(hostname)
    if (literals) {
      if (literals.some(isReservedAddress)) refuse(options, hostname)
      return
    }

    const isProxied = Boolean(options.agent)
    if (isProxied && (await isReservedIp(hostname))) {
      refuse(options, hostname)
    }

    connectThroughSsrfLookup(options, hostname)
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
