'use strict'

const isAbsoluteUrl = require('is-absolute-url')
const reachableUrl = require('reachable-url')
const isEmail = require('is-email-like')
const pTimeout = require('p-timeout')
const urlRegex = require('url-regex')
const { get } = require('lodash')
const pAny = require('p-any')

const { providers, providersBy } = require('../providers')
const { gotOpts } = require('../util/got')

const { isReachable } = reachableUrl

const { AVATAR_TIMEOUT } = require('../constant')

const is = input => {
  if (isEmail(input)) return 'email'
  if (urlRegex({ strict: false }).test(input)) return 'domain'
  return 'username'
}

const getAvatarUrl = async (fn, input) => {
  const avatarUrl = await fn(input)
  if (!isAbsoluteUrl(avatarUrl)) throw new Error('Avatar URL is not valid.')
  const { statusCode, url } = await reachableUrl(avatarUrl, gotOpts)
  if (!isReachable({ statusCode })) throw new Error(`Avatar \`${url}\` returns \`${statusCode}\``)
  return url
}

module.exports = async input => {
  const collection = get(providersBy, is(input))
  const promises = collection.map(providerName =>
    pTimeout(getAvatarUrl(get(providers, providerName), input), AVATAR_TIMEOUT)
  )
  return pAny(promises)
}
