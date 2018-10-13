'use strict'

const { forEach } = require('lodash')

const createGetAvatarUrl = require('./avatar-url')
const { logLevel } = require('./constant')
const { providers } = require('./providers')

module.exports = (app, express) => {
  app
    .use(require('helmet')())
    .use(require('compression')())
    .use(require('cors')())
    .use(require('morgan')(logLevel))
    .use(express.static('static'))
    .disable('x-powered-by')

  app.get('/', (req, res) => res.status(204).send())
  app.get('/robots.txt', (req, res) => res.status(204).send())
  app.get('/favicon.txt', (req, res) => res.status(204).send())

  app.get(`/:key`, createGetAvatarUrl())

  forEach(providers, (fn, provider) =>
    app.get(`/${provider}/:key`, createGetAvatarUrl(fn))
  )

  app.use(express.static('static'))

  return app
}
