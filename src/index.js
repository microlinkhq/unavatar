'use strict'

const { forEach } = require('lodash')
const isEmail = require('is-email-like')
const aigle = require('aigle')
const got = require('got')

const { services, servicesBy } = require('./services')

const sendAvatar = ({ url, res }) => {
  const stream = got.stream(url)
  stream.on('response', resAvatar =>
    res.set('Content-Type', resAvatar.headers['content-type'])
  )
  return stream.pipe(res)
}

const createAvatarFromService = (fn, { json }) => async (req, res) => {
  const { key } = req.params
  const url = await fn(key)
  return json ? res.json({ url }) : sendAvatar({ res, url })
}

const createAvatarBy = ({ json }) => async (req, res) => {
  const { key } = req.params
  const collection = isEmail(key) ? servicesBy.email : servicesBy.username

  const url = await aigle
    .resolve(collection)
    .map(service => services[service](key))
    .find(url => got.head(url))

  return json ? res.json({ url }) : sendAvatar({ res, url })
}

module.exports = (app, express) => {
  app
    .use(require('helmet')())
    .use(require('compression')())
    .use(require('cors')())
    .use(require('morgan')('combined'))
    .use(express.static('static'))
    .disable('x-powered-by')

  app.get('/', (req, res) => res.status(204).send())
  app.get('/robots.txt', (req, res) => res.status(204).send())
  app.get('/favicon.txt', (req, res) => res.status(204).send())

  app.get(`/:key`, createAvatarBy({ json: false }))
  app.get(`/:key/json`, createAvatarBy({ json: true }))

  forEach(services, (fn, service) => {
    app.get(`/${service}/:key`, createAvatarFromService(fn, { json: false }))
    app.get(
      `/${service}/:key/json`,
      createAvatarFromService(fn, { json: true })
    )
  })

  return app
}
