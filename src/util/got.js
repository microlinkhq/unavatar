'use strict'

const uniqueRandomArray = require('unique-random-array')
const CacheableLookup = require('cacheable-lookup')
const userAgents = require('top-user-agents')
const tlsHook = require('https-tls/hook')
const got = require('got')

const randomUserAgent = uniqueRandomArray(userAgents)

const dnsCache = new CacheableLookup()
dnsCache.servers = ['1.1.1.1', '1.0.0.1']

const userAgentHook = options => {
  options.headers['user-agent'] = randomUserAgent()
}

const gotOpts = {
  dnsCache,
  https: { rejectUnauthorized: false },
  retry: 1,
  headers: { 'user-agent': undefined },
  hooks: { beforeRequest: [userAgentHook, tlsHook] }
}

module.exports = got.extend(gotOpts)
module.exports.gotOpts = gotOpts
