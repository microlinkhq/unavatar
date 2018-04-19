'use strict'

const { forEach } = require('lodash')

const { createGetAvatarUrl } = require('./helpers')
const { logLevel } = require('./constant')
const { services } = require('./services')

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
  app.get(`/:key/json`, createGetAvatarUrl({ isJSON: true }))

  forEach(services, (urlFn, service) => {
    app.get(`/${service}/:key`, createGetAvatarUrl({ urlFn }))
    app.get(
      `/${service}/:key/json`,
      createGetAvatarUrl({ urlFn, isJSON: true })
    )
  })

  app.use(express.static('static'))

  return app
}
