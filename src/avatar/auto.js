'use strict'

const isAbsoluteUrl = require('is-absolute-url')
const dataUriRegex = require('data-uri-regex')
const isEmail = require('is-email-like')
const pTimeout = require('p-timeout')
const urlRegex = require('url-regex')
const pAny = require('p-any')

const { providers, providersBy } = require('../providers')
const reachableUrl = require('../util/reachable-url')
const isIterable = require('../util/is-iterable')
const ExtendableError = require('../util/error')

const { STATUS_CODES } = require('http')
const { AVATAR_TIMEOUT } = require('../constant')

const is = ({ input }) => {
  if (isEmail(input)) return 'email'
  if (urlRegex({ strict: false }).test(input)) return 'domain'
  return 'username'
}

const getAvatarContent = name => async input => {
  if (typeof input !== 'string' || input === '') {
    const message =
      input === undefined ? 'not found' : `\`${input}\` is invalid`
    const statusCode = input === undefined ? 404 : 400
    throw new ExtendableError({ name, message, statusCode })
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

  const { statusCode, url } = await reachableUrl(input)

  if (!reachableUrl.isReachable({ statusCode })) {
    throw new ExtendableError({
      message: STATUS_CODES[statusCode],
      name,
      statusCode
    })
  }

  return { type: 'url', data: url }
}

const getAvatar = async (fn, { name, args }) => {
  const promise = fn(args)
    .then(getAvatarContent(name))
    .catch(error => {
      isIterable.forEach(error, error => {
        error.statusCode = error.statusCode ?? error.response?.statusCode
        error.name = name
      })
      throw error
    })

  return pTimeout(promise, AVATAR_TIMEOUT).catch(error => {
    error.name = name
    throw error
  })
}

module.exports = async args => {
  const collection = providersBy[is(args)]
  const promises = collection.map(name =>
    pTimeout(getAvatar(providers[name], { name, args }), AVATAR_TIMEOUT)
  )
  return pAny(promises)
}

module.exports.getAvatar = getAvatar
