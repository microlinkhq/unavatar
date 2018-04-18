'use strict'

const { forEach, reduce } = require('lodash')
const isEmail = require('is-email-like')
const aigle = require('aigle')
const got = require('got')

const services = require('./services')

const servicesBy = reduce(
  services,
  (acc, service, serviceName) => {
    const { supported } = service
    if (supported.email) acc.email.push(serviceName)
    if (supported.username) acc.username.push(serviceName)
    return acc
  },
  { email: [], username: [] }
)

const createAvatarFromService = (fn, { json }) => async (req, res) => {
  const { key } = req.params
  const url = await fn(key)
  if (json) return res.json({ url })
  const stream = got.stream(url)
  stream.on('response', resAvatar =>
    res.set('Content-Type', resAvatar.headers['content-type'])
  )
  return stream.pipe(res)
}

const createAvatarBy = ({ json }) => async (req, res) => {
  const { key } = req.params
  const collection = isEmail(key) ? servicesBy.email : servicesBy.username

  const url = await aigle
    .resolve(collection)
    .map(service => services[service](key))
    .find(url => got.head(url))

  if (json) return res.json({ url })
  const stream = got.stream(url)
  stream.on('response', resAvatar =>
    res.set('Content-Type', resAvatar.headers['content-type'])
  )
  return stream.pipe(res)
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

  forEach(services, (service, serviceName) => {
    app.get(
      `/${serviceName}/:key`,
      createAvatarFromService(service, { json: false })
    )
    app.get(
      `/${serviceName}/:key/json`,
      createAvatarFromService(service, { json: true })
    )
  })

  return app
}
