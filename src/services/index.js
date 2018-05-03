'use strict'

const { reduce } = require('lodash')

const services = {
  twitter: require('./twitter'),
  instagram: require('./instagram'),
  clearbit: require('./clearbit'),
  github: require('./github'),
  facebook: require('./facebook'),
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
