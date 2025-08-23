'use strict'

process.env.DEBUG =
  process.env.DEBUG ||
  '*,-html-get*,-puppeteer*,-send*,-ioredis*,-cacheable-response*,-browserless*'

const debug = require('debug-logfmt')('unavatar')
const { createServer } = require('http')

const { API_URL, NODE_ENV, PORT } = require('./constant')

const server = createServer((req, res) =>
  require('./util/uuid').withUUID(() => require('.')(req, res))
)

server.listen(PORT, () => {
  debug({
    status: 'listening',
    environment: NODE_ENV,
    pid: process.pid,
    address: API_URL
  })
})

let isClosing = false

if (NODE_ENV === 'production') {
  process.on('SIGTERM', () => (isClosing = true))

  /**
   * It uses Fly.io v2 to scale to zero, similar to AWS Lambda
   * https://community.fly.io/t/implementing-scale-to-zero-is-super-easy/12415
   */
  const keepAlive = (duration => {
    let timer
    const keepAlive = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        server.close(async () => {
          debug({
            status: 'shutting down',
            reason: `No request received in ${duration / 1000}s`
          })
          await require('./billing').teardown()
          process.exit(0)
        })
      }, duration)
    }
    keepAlive()
    return keepAlive
  })(10000)

  server.on('request', () => !isClosing && keepAlive())
}

process.on('uncaughtException', error => {
  debug.error('uncaughtException', {
    message: error.message || error,
    requestUrl: error.response?.requestUrl,
    stack: error.stack
  })
})
