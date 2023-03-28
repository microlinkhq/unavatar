'use strict'

const { default: listen } = require('async-listen')
const { createServer } = require('http')

const close = server => new Promise(resolve => server.close(resolve))

const runServer = async t => {
  const server = createServer(require('../src'))
  const serverUrl = await listen(server)
  t.teardown(() => close(server))
  return serverUrl
}

module.exports = { runServer }
