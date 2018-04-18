'use strict'

const { reduce } = require('lodash')

const services = {
  github: require('./github'),
  gravatar: require('./gravatar'),
  instagram: require('./instagram'),
  twitter: require('./twitter')
}

const servicesBy = reduce(
  services,
  (acc, { supported }, service) => {
    if (supported.email) acc.email.push(service)
    if (supported.username) acc.username.push(service)
    return acc
  },
  { email: [], username: [] }
)

module.exports = { services, servicesBy }
