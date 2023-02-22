'use strict'

const serveStatic = require('serve-static')
const createRouter = require('router-http')
const { forEach } = require('lodash')
const path = require('path')

const { providers } = require('./providers')
const ssrCache = require('./send/cache')
const avatar = require('./avatar')

const { NODE_ENV } = require('./constant')

const router = createRouter((error, req, res) => {
  const hasError = error !== undefined
  res.statusCode = hasError ? error.code ?? 500 : 404
  res.end(hasError ? error.message ?? 'Internal Server Error' : 'Not Found')
})

router
  .use(
    require('helmet')({ crossOriginResourcePolicy: false }),
    require('http-compression')(),
    require('cors')(),
    require('morgan')(function (tokens, req, res) {
      return [
        '',
        req.headers['cf-connecting-ip'],
        tokens.url(req, res),
        tokens.status(req, res),
        '–',
        tokens['response-time'](req, res),
        'ms'
      ].join(' ')
    }),
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
