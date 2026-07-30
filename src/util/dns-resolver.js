'use strict'

const Tangerine = require('tangerine')
const got = require('got')

module.exports = ({ DNS_TIMEOUT, DNS_SERVERS }) =>
  new Tangerine(
    {
      cache: false,
      timeout: DNS_TIMEOUT,
      servers: DNS_SERVERS
    },
    got.extend({
      responseType: 'buffer',
      decompress: false,
      retry: 0
    })
  )
