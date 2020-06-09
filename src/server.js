'use strict'

const debug = require('debug-logfmt')('unavatar')
const server = require('..')

const port = process.env.PORT || process.env.port || 3000

server.on('error', err => {
  debug({ status: 'error', message: err.message, trace: err.stack })
  process.exit(1)
})

server.listen(port, function () {
  debug({
    status: 'listening',
    pid: process.pid,
    address: `http://localhost:${port}`
  })
})
