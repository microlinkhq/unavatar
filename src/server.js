'use strict'

const debug = require('debug-logfmt')('unavatar')
const server = require('.')

const { PORT } = require('./constant')

server.listen(PORT, () => {
  debug({
    status: 'listening',
    pid: process.pid,
    address: `http://localhost:${PORT}`
  })
})
