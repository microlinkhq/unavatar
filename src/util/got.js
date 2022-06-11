'use strict'

const uniqueRandomArray = require('unique-random-array')
const CacheableLookup = require('cacheable-lookup')
const userAgents = require('top-user-agents')
const tlsHook = require('https-tls/hook')
const got = require('got')

const randUserAgent = uniqueRandomArray(userAgents)

const dnsCache = new CacheableLookup()

dnsCache.servers = [...new Set(['1.1.1.1', '1.0.0.1', ...dnsCache.servers])]

const userAgentHook = options => {
  if (
    options.headers['user-agent'] ===
    'got (https://github.com/sindresorhus/got)'
  ) {
    options.headers['user-agent'] = randUserAgent()
  }
}

const gotOpts = {
  dnsCache,
  https: { rejectUnauthorized: false },
  headers: { 'user-agent': undefined },
  hooks: { beforeRequest: [userAgentHook, tlsHook] }
}

module.exports = got.extend(gotOpts)
module.exports.gotOpts = gotOpts
