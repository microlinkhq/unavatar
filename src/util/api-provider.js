'use strict'

const debug = require('debug-logfmt')('api-provider')

const httpStatus = require('./http-status')
const ExtendableError = require('./error')
const { NOT_FOUND } = require('./html-provider')

const BLOCKED_STATUS_CODES = new Set([
  httpStatus.FORBIDDEN,
  httpStatus.TOO_MANY_REQUESTS
])

const MISS = {
  blocked: {
    code: 'blocked',
    blocked: true,
    message: 'The provider blocked the request.'
  },
  upstreamError: {
    code: 'upstream_error',
    blocked: false,
    message: 'The provider answered with an error.'
  },
  empty: {
    code: 'empty_getter_result',
    blocked: false,
    message: 'Empty value returned by the provider.'
  }
}

const createProviderError = ({ provider, statusCode, miss }) =>
  new ExtendableError({ provider, statusCode, ...miss })

const BODY_PARSE_FAILURE = 'ERR_BODY_PARSE_FAILURE'

const isProviderMiss = error =>
  error instanceof ExtendableError && typeof error.blocked === 'boolean'

const swallowProviderMiss = error => {
  if (isProviderMiss(error)) return undefined
  throw error
}

const toTierGotOpts = ({ timeout, agent } = {}) => ({
  ...(agent && { agent }),
  ...(timeout && { timeout: { request: timeout } })
})

module.exports = ({ got, PROXY_TIMEOUT, onFetch }) => {
  const createApiProvider = ({ name, url, getter, isBlocked, gotOpts }) => {
    async function provider (input, context) {
      const providerUrl = await url(input)

      const attempt = async ({
        tier = 'origin',
        gotOpts: tierGotOpts
      } = {}) => {
        const log = debug.duration({ provider: name, input, providerUrl, tier })

        const { body, statusCode } = await got(providerUrl, {
          timeout: { request: PROXY_TIMEOUT },
          ...gotOpts?.(),
          responseType: 'json',
          throwHttpErrors: false,
          retry: { limit: 0 },
          ...toTierGotOpts(tierGotOpts)
        }).catch(error => {
          if (error.code === BODY_PARSE_FAILURE) {
            log.error({
              statusCode: error.response?.statusCode,
              status: 'blocked',
              reason: 'non_json_body'
            })
            throw createProviderError({
              provider: name,
              statusCode: error.response?.statusCode,
              miss: MISS.blocked
            })
          }
          log.error({
            status: 'request_failed',
            code: error.code,
            message: error.message
          })
          throw error
        })

        const response = { body, statusCode }

        if (BLOCKED_STATUS_CODES.has(statusCode) || isBlocked?.(response)) {
          log.error({ statusCode, status: 'blocked' })
          throw createProviderError({
            provider: name,
            statusCode,
            miss: MISS.blocked
          })
        }

        if (statusCode === httpStatus.NOT_FOUND) {
          log.error({ statusCode, status: 'not_found' })
          return NOT_FOUND
        }

        if (statusCode >= httpStatus.BAD_REQUEST) {
          log.error({ statusCode, status: 'upstream_error' })
          throw createProviderError({
            provider: name,
            statusCode,
            miss: MISS.upstreamError
          })
        }

        const result = getter(response)

        if (result === NOT_FOUND) {
          log.error({ statusCode, status: 'not_found' })
          return NOT_FOUND
        }

        if (typeof result === 'string' && result !== '') {
          log({ statusCode, status: 'success', result })
          return result
        }

        log.error({ statusCode, status: 'empty' })
        throw createProviderError({
          provider: name,
          statusCode,
          miss: MISS.empty
        })
      }

      const result =
        typeof onFetch === 'function'
          ? await onFetch({
            ...context,
            attempt,
            provider: name,
            providerUrl,
            kind: 'api'
          })
          : await attempt().catch(swallowProviderMiss)

      return result === NOT_FOUND ? undefined : result
    }

    provider.getUrl = url
    return provider
  }

  return { createApiProvider }
}
