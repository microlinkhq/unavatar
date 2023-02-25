'use strict'

const debug = require('debug-logfmt')('unavatar')
const serveStatic = require('serve-static')
const createRouter = require('router-http')
const onFinished = require('on-finished')
const { forEach } = require('lodash')
const send = require('send-http')
const path = require('path')

const { providers } = require('./providers')
const ssrCache = require('./send/cache')
const avatar = require('./avatar')

const { NODE_ENV } = require('./constant')

const timestamp =
  (start = process.hrtime.bigint()) =>
    () =>
      Math.round(Number(process.hrtime.bigint() - start) / 1e6)

const router = createRouter((error, req, res) => {
  const hasError = error !== undefined
  let statusCode = 404
  let data = 'Not Found'

  if (hasError) {
    statusCode = error.statusCode ?? 500
    data = error.message ?? 'Internal Server Error'
    if (error.statusCode === undefined) console.error(error)
    if ('headers' in error) {
      for (const [key, value] of Object.entries(error.headers)) {
        res.setHeader(key, value)
      }
    }
  }

  return send(res, statusCode, data)
})

router
  .use(
    (req, res, next) => {
      req.timestamp = timestamp()
      req.ipAddress = req.headers['cf-connecting-ip'] || '::ffff:127.0.0.1'
      req.query = Array.from(new URLSearchParams(req.query).entries()).reduce(
        (acc, [key, value]) => {
          try {
            acc[key] = value === '' ? true : JSON.parse(value)
          } catch (err) {
            acc[key] = value
          }
          return acc
        },
        {}
      )
      onFinished(res, () => {
        debug(
          `${req.ipAddress} ${req.url} ${res.statusCode} ${req.timestamp()}ms`
        )
      })
      next()
    },
    require('helmet')({ crossOriginResourcePolicy: false }),
    require('http-compression')(),
    require('cors')(),
    serveStatic(path.resolve('public'), {
      immutable: true,
      maxAge: '1y'
    }),
    NODE_ENV === 'production' && require('./authentication')
  )
  .get('/:key', (req, res) =>
    ssrCache({
      req,
      res,
      fn: avatar.resolve(avatar.auto)
    })
  )

forEach(providers, (fn, provider) =>
  router.get(`/${provider}/:key`, (req, res) =>
    ssrCache({ req, res, fn: avatar.resolve(avatar.provider(fn)) })
  )
)

module.exports = router
