'use strict'

const CacheableLookup = require('cacheable-lookup')
const got = require('got')

const dnsCache = new CacheableLookup()
dnsCache.servers = ['1.1.1.1', '1.0.0.1']

const gotOpts = {
  dnsCache,
  https: { rejectUnauthorized: false },
  retry: 0
}

module.exports = got.extend(gotOpts)
module.exports.gotOpts = gotOpts
