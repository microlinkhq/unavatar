'use strict'

const uniqueRandomArray = require('unique-random-array')
const tlsHook = require('https-tls/hook')
const uaHints = require('ua-hints')
const got = require('got')

const topUserAgents = require('top-user-agents')
const randomUserAgent = uniqueRandomArray(topUserAgents)
const precomputedUaHints = new Map(topUserAgents.map(userAgent => [userAgent, uaHints(userAgent)]))

const getUaHints = userAgent => {
  const precomputed = precomputedUaHints.get(userAgent)
  if (precomputed !== undefined) return precomputed

  return uaHints(userAgent)
}

const userAgentHook = options => {
  let userAgent = options.headers['user-agent']
  if (userAgent === 'got (https://github.com/sindresorhus/got)') {
    userAgent = randomUserAgent()
    options.headers['user-agent'] = userAgent
  }

  for (const [key, value] of Object.entries(getUaHints(userAgent))) {
    options.headers[key] = value
  }
}

module.exports = ({ cacheableLookup }) => {
  const gotOpts = {
    dnsCache: cacheableLookup,
    https: { rejectUnauthorized: false },
    hooks: { beforeRequest: [userAgentHook, tlsHook] }
  }

  const instance = got.extend(gotOpts)
  instance.gotOpts = gotOpts

  return instance
}
