'use strict'

const debug = require('debug-logfmt')('unavatar')
const serveStatic = require('serve-static')
const createRouter = require('router-http')
const onFinished = require('on-finished')
const { format } = require('@lukeed/ms')
const { forEach } = require('lodash')
const send = require('send-http')
const path = require('path')

const timeSpan = require('@kikobeats/time-span')({
  format: n => format(Math.round(n))
})

const { providers } = require('./providers')
const ssrCache = require('./send/cache')
const avatar = require('./avatar')

const { isProduction, API_URL } = require('./constant')

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
    (req, _, next) => {
      req.ipAddress = req.headers['cf-connecting-ip'] || '::ffff:127.0.0.1'
      next()
    },
    require('helmet')({
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: false
    }),
    require('http-compression')(),
    require('cors')(),
    serveStatic(path.resolve('public'), {
      immutable: true,
      maxAge: '1y'
    }),
    require('./authentication'),
    isProduction && require('./ua'),
    (req, res, next) => {
      req.timestamp = timeSpan()
      req.query = Array.from(new URLSearchParams(req.query)).reduce(
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
          `${req.ipAddress} ${new URL(req.url, API_URL).toString()} ${
            res.statusCode
          } ${req.timestamp()}`
        )
      })
      next()
    }
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
    ssrCache({ req, res, fn: avatar.resolve(avatar.provider(provider, fn)) })
  )
)

module.exports = router
