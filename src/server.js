'use strict'

const debug = require('debug-logfmt')('unavatar')
const server = require('..')

const port = process.env.PORT || process.env.port || 3000

server.listen(port, function () {
  debug({
    status: 'listening',
    pid: process.pid,
    address: `http://localhost:${port}`
  })
})
