'use strict'

const { reduce } = require('lodash')

const providers = {
  deviantart: require('./deviantart'),
  dribbble: require('./dribbble'),
  duckduckgo: require('./duckduckgo'),
  github: require('./github'),
  gitlab: require('./gitlab'),
  google: require('./google'),
  gravatar: require('./gravatar'),
  // instagram: require('./instagram'),
  microlink: require('./microlink'),
  readcv: require('./readcv'),
  // reddit: require('./reddit'),
  soundcloud: require('./soundcloud'),
  substack: require('./substack'),
  telegram: require('./telegram'),
  // tiktok: require('./tiktok'),
  twitch: require('./twitch'),
  x: require('./x'),
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
