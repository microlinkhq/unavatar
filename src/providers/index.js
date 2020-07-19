'use strict'

const { reduce } = require('lodash')

const providers = {
  clearbit: require('./clearbit'),
  deviantart: require('./deviantart'),
  facebook: require('./facebook'),
  github: require('./github'),
  gitlab: require('./gitlab'),
  gravatar: require('./gravatar'),
  instagram: require('./instagram'),
  soundcloud: require('./soundcloud'),
  telegram: require('./telegram'),
  twitter: require('./twitter'),
  youtube: require('./youtube'),
  reddit: require('./reddit'),
  dribbble: require('./dribbble')
}

const providersBy = reduce(
  providers,
  (acc, { supported }, provider) => {
    if (supported.email) acc.email.push(provider)
    if (supported.username) acc.username.push(provider)
    if (supported.domain) acc.domain.push(provider)
    return acc
  },
  { email: [], username: [], domain: [] }
)

module.exports = { providers, providersBy }
