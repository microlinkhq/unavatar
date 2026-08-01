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

const factory = ({
  constants,
  providers,
  providerTiers,
  reachableUrl,
  isReservedIp
}) => {
  const { REQUEST_TIMEOUT } = constants

  const refuseReservedAddress = provider => {
    throw new ExtendableError({
      message: 'The URL points to a reserved address.',
      provider,
      statusCode: httpStatus.FORBIDDEN
    })
  }

  const assertPublicUrl = async (url, provider) => {
    if (await isReservedIp(new URL(url).hostname)) { refuseReservedAddress(provider) }
  }

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

    await assertPublicUrl(output, provider)

    const { statusCode, url, reservedAddress } = await reachableUrl(output)

    if (reservedAddress) refuseReservedAddress(provider)
    await assertPublicUrl(url, provider)

    if (!reachableUrl.isReachable({ statusCode })) {
      throw new ExtendableError({
        message: httpStatus(statusCode),
        provider,
        statusCode
      })
    }

    return { type: 'url', data: url, provider }
  }

  const getAvatar = async (
    fn,
    provider,
    input,
    context,
    deadline = Date.now() + REQUEST_TIMEOUT
  ) => {
    const promise = Promise.resolve(fn(input, context))
      .then(getAvatarContent(provider))
      .catch(error => {
        isIterable.forEach(error, error => {
          error.statusCode = error.statusCode ?? error.response?.statusCode
          error.provider = provider
        })
        throw error
      })

    return pTimeout(promise, Math.max(0, deadline - Date.now())).catch(
      error => {
        error.provider = provider
        throw error
      }
    )
  }

  const raceTier = (tier, input, context, deadline) =>
    pAny(
      tier.map(provider =>
        getAvatar(providers[provider], provider, input, context, deadline)
      )
    )

  const auto = inputType => async (input, context) => {
    const tierKey =
      inputType === 'email' && isHash(input) ? 'emailHash' : inputType
    const tiers = providerTiers[tierKey]

    if (!tiers?.length) {
      throw new ExtendableError({
        message: `No providers declared for \`${tierKey}\`.`,
        statusCode: httpStatus.NOT_FOUND
      })
    }

    const deadline = Date.now() + REQUEST_TIMEOUT

    let firstError

    for (const tier of tiers) {
      try {
        return await raceTier(tier, input, context, deadline)
      } catch (error) {
        firstError ??= error
        if (Date.now() >= deadline) break
      }
    }

    throw firstError
  }

  return { auto, getInputType, getAvatar }
}

factory.getInputType = getInputType

module.exports = factory
