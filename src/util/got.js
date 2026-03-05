'use strict'

const uniqueRandomArray = require('unique-random-array')
const tlsHook = require('https-tls/hook')
const uaHints = require('ua-hints')
const got = require('got')

const randomUserAgent = uniqueRandomArray(require('top-user-agents'))

const userAgentHook = options => {
  if (options.headers['user-agent'] === 'got (https://github.com/sindresorhus/got)') {
    const userAgent = randomUserAgent()
    options.headers['user-agent'] = userAgent
  }

  for (const [key, value] of Object.entries(uaHints(options.headers['user-agent']))) {
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
