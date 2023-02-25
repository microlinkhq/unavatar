'use strict'

const uniqueRandomArray = require('unique-random-array')
const CacheableLookup = require('cacheable-lookup')
const userAgents = require('top-user-agents')
const tlsHook = require('https-tls/hook')
const Tangerine = require('tangerine')
const got = require('got')

const randUserAgent = uniqueRandomArray(userAgents)

const dnsCache = new CacheableLookup(
  { resolver: new Tangerine() },
  got.extend({
    responseType: 'buffer',
    decompress: false
  })
)

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
