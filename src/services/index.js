'use strict'

const { reduce } = require('lodash')

const services = {
  twitter: require('./twitter'),
  gravatar: require('./gravatar'),
  github: require('./github')
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
