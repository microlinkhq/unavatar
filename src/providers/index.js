'use strict'

const { reduce } = require('lodash')

const providers = {
  twitter: require('./twitter'),
  instagram: require('./instagram'),
  clearbit: require('./clearbit'),
  github: require('./github'),
  facebook: require('./facebook'),
  telegram: require('./telegram'),
  youtube: require('./youtube'),
  soundcloud: require('./soundcloud'),
  deviantart: require('./deviantart'),
  // gravatar returns a default avatar, so use it as fallback
  gravatar: require('./gravatar')
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
