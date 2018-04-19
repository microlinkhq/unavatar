'use strict'

const { reduce } = require('lodash')

const services = {
  instagram: require('./instagram'),
  twitter: require('./twitter'),
  domain: require('./domain'),
  github: require('./github'),
  // the services that return defaulta avatar, go after!
  gravatar: require('./gravatar')
}

const servicesBy = reduce(
  services,
  (acc, { supported }, service) => {
    if (supported.email) acc.email.push(service)
    if (supported.username) acc.username.push(service)
    if (supported.domain) acc.domain.push(service)
    return acc
  },
  { email: [], username: [], domain: [] }
)

module.exports = { services, servicesBy }
