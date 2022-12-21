'use strict'

const serveStatic = require('serve-static')
const { forEach } = require('lodash')
const polka = require('polka')
const path = require('path')

const { providers } = require('./providers')
const ssrCache = require('./send/cache')
const avatar = require('./avatar')

const app = polka()

app.use(require('helmet')({ crossOriginResourcePolicy: false }))
app.use(require('compression')())
app.use(require('cors')())
app.use(
  require('morgan')(function (tokens, req, res) {
    return [
      '',
      req.headers['cf-connecting-ip'],
      tokens.url(req, res),
      tokens.status(req, res),
      ' – ',
      tokens['response-time'](req, res),
      'ms'
    ].join(' ')
  })
)

app.use(
  serveStatic(path.resolve('public'), {
    immutable: true,
    maxAge: '1y'
  })
)
app.use(require('./authentication'))

app.get('/:key', (req, res) =>
  ssrCache({
    req,
    res,
    fn: avatar.resolve(avatar.auto)
  })
)

forEach(providers, (fn, provider) =>
  app.get(`/${provider}/:key`, (req, res) =>
    ssrCache({ req, res, fn: avatar.resolve(avatar.provider(fn)) })
  )
)

module.exports = app
