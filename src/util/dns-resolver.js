'use strict'

const Tangerine = require('tangerine')

module.exports = ({ DNS_TIMEOUT, DNS_SERVERS }) =>
  new Tangerine(
    {
      cache: false,
      timeout: DNS_TIMEOUT,
      servers: DNS_SERVERS
    },
    require('got').extend({
      responseType: 'buffer',
      decompress: false,
      retry: 0
    })
  )
