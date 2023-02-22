'use strict'

const debug = require('debug-logfmt')('unavatar')
const { createServer } = require('http')

const { PORT } = require('./constant')

const server = createServer(require('.'))

server.listen(PORT, () => {
  debug({
    status: 'listening',
    pid: process.pid,
    address: `http://localhost:${PORT}`
  })
})
