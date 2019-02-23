'use strict'

const cacheableResponse = require('cacheable-response')
const { forEach } = require('lodash')

const { CACHE_TTL, IS_DEVELOPMENT, LOG_LEVEL } = require('./constant')
const createGetAvatarUrl = require('./avatar-url')
const { providers } = require('./providers')

const send = require('./send')

const ssrCache = (() => {
  if (IS_DEVELOPMENT) {
    return async ({ req, res, fn }) => {
      const data = await fn(req, res)
      return send({ req, res, ...data })
    }
  }

  return cacheableResponse({
    ttl: CACHE_TTL,
    get: async ({ req, res, fn }) => ({
      data: await fn(req, res)
    }),
    send: ({ req, res, data }) => send({ req, res, ...data })
  })
})()

module.exports = (app, express) => {
  app
    .use(require('helmet')())
    .use(require('compression')())
    .use(require('cors')())
    .use(require('morgan')(LOG_LEVEL))
    .use(express.static('static'))
    .disable('x-powered-by')

  app.get('/', (req, res) => res.status(204).send())
  app.get('/robots.txt', (req, res) => res.status(204).send())
  app.get('/favicon.txt', (req, res) => res.status(204).send())

  const getAvatar = createGetAvatarUrl()

  app.get(`/:key`, (req, res) => ssrCache({ req, res, fn: getAvatar }))

  forEach(providers, (fn, provider) => {
    const getAvatarByProvider = createGetAvatarUrl(fn)
    app.get(`/${provider}/:key`, (req, res) =>
      ssrCache({ req, res, fn: getAvatarByProvider })
    )
  })

  app.use(express.static('static'))

  return app
}
