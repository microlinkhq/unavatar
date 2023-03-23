'use strict'

const isAbsoluteUrl = require('is-absolute-url')
const dataUriRegex = require('data-uri-regex')
const reachableUrl = require('reachable-url')
const isEmail = require('is-email-like')
const pTimeout = require('p-timeout')
const urlRegex = require('url-regex')
const pAny = require('p-any')

const { providers, providersBy } = require('../providers')
const isIterable = require('../util/is-iterable')
const ExtendableError = require('../util/error')
const { gotOpts } = require('../util/got')

const { STATUS_CODES } = require('http')
const { AVATAR_TIMEOUT } = require('../constant')

const is = input => {
  if (isEmail(input)) return 'email'
  if (urlRegex({ strict: false }).test(input)) return 'domain'
  return 'username'
}

const getAvatarContent = name => async input => {
  if (typeof input !== 'string' || input === '') {
    throw new ExtendableError({
      name,
      message: `Avatar \`${input}\` is invalid.`,
      statusCode: 400
    })
  }

  if (dataUriRegex().test(input)) {
    return { type: 'buffer', data: input }
  }

  if (!isAbsoluteUrl(input)) {
    throw new ExtendableError({
      message: 'The URL must to be absolute.',
      name,
      statusCode: 400
    })
  }

  const { statusCode, url } = await reachableUrl(input, gotOpts)

  if (!reachableUrl.isReachable({ statusCode })) {
    throw new ExtendableError({
      message: STATUS_CODES[statusCode],
      name,
      statusCode
    })
  }

  return { type: 'url', data: url }
}

const getAvatar = async (fn, ...args) => {
  const promise = Promise.resolve(fn(...args))
    .then(getAvatarContent(fn.name))
    .catch(error => {
      isIterable.forEach(error, error => {
        error.statusCode = error.statusCode ?? error.response?.statusCode
        error.name = fn.name
      })
      throw error
    })

  return pTimeout(promise, AVATAR_TIMEOUT).catch(error => {
    error.name = fn.name
    throw error
  })
}

module.exports = async input => {
  const collection = providersBy[is(input)]
  const promises = collection.map(providerName =>
    pTimeout(getAvatar(providers[providerName], input), AVATAR_TIMEOUT)
  )
  return pAny(promises)
}

module.exports.getAvatar = getAvatar
