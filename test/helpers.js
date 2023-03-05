'use strict'

const { once } = require('events')
const http = require('http')

const listen = async (server, ...args) => {
  server.listen(...args)
  await once(server, 'listening')
  const { address, port, family } = server.address()
  return `http://${family === 'IPv6' ? `[${address}]` : address}:${port}/`
}

const close = server => new Promise(resolve => server.close(resolve))

const createServer = async t => {
  const server = http.createServer(require('../src'))
  const serverUrl = await listen(server)
  t.teardown(() => close(server))
  return serverUrl
}

module.exports = { createServer }
