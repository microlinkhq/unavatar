'use strict'

const serveStatic = require('serve-static')
const { forEach } = require('lodash')
const polka = require('polka')
const path = require('path')

const { providers } = require('./providers')
const { LOG_LEVEL } = require('./constant')

const ssrCache = require('./send/cache')
const avatar = require('./avatar')

const app = polka()

app.use(
  require('helmet')({
    crossOriginResourcePolicy: false
  })
)

app.use(require('compression')())
app.use(require('cors')())
app.use(require('morgan')(LOG_LEVEL))
app.use(serveStatic(path.resolve('public')))

app.get('/robots.txt', (req, res) => res.status(204).send())
app.get('/favicon.ico', (req, res) => res.status(204).send())

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
