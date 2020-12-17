'use strict'

const { reduce } = require('lodash')

const providers = {
  clearbit: require('./clearbit'),
  deviantart: require('./deviantart'),
  dribbble: require('./dribbble'),
  duckduckgo: require('./duckduckgo'),
  facebook: require('./facebook'),
  github: require('./github'),
  gitlab: require('./gitlab'),
  gravatar: require('./gravatar'),
  instagram: require('./instagram'),
  reddit: require('./reddit'),
  soundcloud: require('./soundcloud'),
  substack: require('./substack'),
  telegram: require('./telegram'),
  twitter: require('./twitter'),
  youtube: require('./youtube')
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
