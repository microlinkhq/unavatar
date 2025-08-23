'use strict'

const timeSpan = require('@kikobeats/time-span')({
  format: n => ms(Math.round(n))
})
const debug = require('debug-logfmt')('unavatar')
const serveStatic = require('serve-static')
const createRouter = require('router-http')
const onFinished = require('on-finished')
const { forEach } = require('lodash')
const send = require('send-http')
const path = require('path')
const ms = require('ms')

const { providers } = require('./providers')
const ssrCache = require('./send/cache')
const avatar = require('./avatar')

const { isProduction, API_URL } = require('./constant')

const router = createRouter((error, _, res) => {
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
      if (req.url.startsWith('/twitter')) {
        res.writeHead(301, { Location: req.url.replace('/twitter', '/x') })
        return res.end()
      }

      if (req.url.startsWith('/pay-as-you-go')) {
        const more = require('./authentication/more')
        res.writeHead(303, { Location: more })
        return res.end()
      }

      req.ipAddress = req.headers['cf-connecting-ip'] || '::ffff:127.0.0.1'
      return next()
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
          } – ${req.timestamp()}`
        )
      })
      return next()
    }
  )
  .get('ping', (_, res) => send(res, 200, 'pong'))
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
