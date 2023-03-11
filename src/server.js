'use strict'

process.env.DEBUG =
  process.env.DEBUG || '*,-puppeteer*,-send*,-ioredis*,-cacheable-response*'

const debug = require('debug-logfmt')('unavatar')
const { createServer } = require('http')

const { API_URL, NODE_ENV, PORT } = require('./constant')

const server = createServer(require('.'))

server.listen(PORT, () => {
  debug({
    status: 'listening',
    environment: NODE_ENV,
    pid: process.pid,
    address: API_URL
  })
})
