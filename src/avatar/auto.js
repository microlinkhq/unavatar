'use strict'

const isAbsoluteUrl = require('is-absolute-url')
const dataUriRegex = require('data-uri-regex')
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

const getAvatarContent = async input => {
  if (typeof input !== 'string' || input === '') {
    throw new Error(`Avatar \`${input}\` is not valid.`)
  }

  if (dataUriRegex().test(input)) {
    return { type: 'buffer', data: input }
  }

  if (!isAbsoluteUrl(input)) {
    throw new Error('Avatar as URL should be absolute.')
  }

  const { statusCode, url } = await reachableUrl(input, gotOpts)

  if (!isReachable({ statusCode })) {
    throw new Error(`Avatar \`${url}\` is unreachable (\`${statusCode}\`)`)
  }

  return { type: 'url', data: url }
}

const getAvatar = async (fn, ...args) => fn(...args).then(getAvatarContent)

module.exports = async input => {
  const collection = get(providersBy, is(input))
  const promises = collection.map(providerName =>
    pTimeout(getAvatar(get(providers, providerName), input), AVATAR_TIMEOUT)
  )
  return pAny(promises)
}

module.exports.getAvatar = getAvatar
