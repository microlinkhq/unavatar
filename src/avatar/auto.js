'use strict'

const isAbsoluteUrl = require('is-absolute-url')
const dataUriRegex = require('data-uri-regex')
const stableRegex = require('stable-regex')
const urlRegex = require('url-regex-safe')
const isEmail = require('is-email-like')
const pTimeout = require('p-timeout')
const pAny = require('p-any')

const httpStatus = require('../util/http-status')
const isIterable = require('../util/is-iterable')
const ExtendableError = require('../util/error')

const DATA_URI_REGEX = dataUriRegex()
const DOMAIN_REGEX = urlRegex({ strict: false })

const isHash = require('../util/is-hash')

const getInputType = input => {
  if (isEmail(input) || isHash(input)) return 'email'
  if (stableRegex(DOMAIN_REGEX, input)) return 'domain'
  return 'username'
}

const factory = ({ constants, providers, providersBy, reachableUrl }) => {
  const { REQUEST_TIMEOUT } = constants
  const providerEntriesByType = Object.fromEntries(
    Object.entries(providersBy).map(([inputType, providerNames]) => [
      inputType,
      providerNames.map(provider => [provider, providers[provider]])
    ])
  )

  const getAvatarContent = provider => async output => {
    if (typeof output !== 'string' || output === '') {
      const message =
        output === undefined ? 'not found' : `\`${output}\` is invalid`
      const statusCode =
        output === undefined
          ? httpStatus.NOT_FOUND
          : httpStatus.UNPROCESSABLE_ENTITY
      throw new ExtendableError({ provider, message, statusCode })
    }

    if (stableRegex(DATA_URI_REGEX, output)) {
      return { type: 'buffer', data: output }
    }

    if (!isAbsoluteUrl(output)) {
      throw new ExtendableError({
        message: 'The URL must to be absolute.',
        provider,
        statusCode: 400
      })
    }

    const { statusCode, url } = await reachableUrl(output)

    if (!reachableUrl.isReachable({ statusCode })) {
      throw new ExtendableError({
        message: httpStatus(statusCode),
        provider,
        statusCode
      })
    }

    return { type: 'url', data: url, provider }
  }

  const getAvatar = async (fn, provider, input, context) => {
    const promise = Promise.resolve(fn(input, context))
      .then(getAvatarContent(provider))
      .catch(error => {
        isIterable.forEach(error, error => {
          error.statusCode = error.statusCode ?? error.response?.statusCode
          error.provider = provider
        })
        throw error
      })

    return pTimeout(promise, REQUEST_TIMEOUT).catch(error => {
      error.provider = provider
      throw error
    })
  }

  const resolveAutoByType = async (inputType, input, context) => {
    let collection = providerEntriesByType[inputType]

    if (inputType === 'email' && isHash(input)) {
      collection = collection.filter(([provider]) => provider === 'gravatar')
    }

    const promises = new Array(collection.length)

    for (let index = 0; index < collection.length; index++) {
      const [provider, fn] = collection[index]
      promises[index] = getAvatar(fn, provider, input, context)
    }

    return pAny(promises)
  }

  const auto = inputType => (input, context) =>
    resolveAutoByType(inputType, input, context)

  return { auto, getInputType, getAvatar }
}

factory.getInputType = getInputType

module.exports = factory
