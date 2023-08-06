'use strict'

const uniqueRandomArray = require('unique-random-array')
const tlsHook = require('https-tls/hook')
const got = require('got')

const randomUserAgent = uniqueRandomArray(require('top-user-agents'))

const userAgentHook = options => {
  if (
    options.headers['user-agent'] ===
    'got (https://github.com/sindresorhus/got)'
  ) {
    options.headers['user-agent'] = randomUserAgent()
  }
}

const gotOpts = {
  dnsCache: require('./cacheable-lookup'),
  https: { rejectUnauthorized: false },
  headers: { 'user-agent': undefined },
  hooks: { beforeRequest: [userAgentHook, tlsHook] }
}

module.exports = got.extend(gotOpts)
module.exports.gotOpts = gotOpts
