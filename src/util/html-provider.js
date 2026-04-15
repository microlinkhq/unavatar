'use strict'

const { normalizeUrl } = require('@metascraper/helpers')
const debug = require('debug-logfmt')('html-provider')
const isAntibot = require('is-antibot')

const randomCrawlerAgent = require('./crawler-agent')
const getOgImage = require('./get-og-image')
const httpStatus = require('./http-status')
const ExtendableError = require('./error')

const NOT_FOUND = Symbol('NOT_FOUND')

const EMPTY_PROVIDER_VALUE_CODE = {
  MISSING_STATUS_CODE: 'missing_status_code',
  EMPTY_GETTER_RESULT: 'empty_getter_result'
}

const isStatusCodeMissing = statusCode =>
  statusCode === undefined || statusCode === null || statusCode === ''

const createProviderError = ({ provider, statusCode, cause, code }) =>
  new ExtendableError({
    provider,
    statusCode,
    cause,
    code,
    message: 'Empty value returned by the provider.'
  })

module.exports = ({ PROXY_TIMEOUT, getHTML, onFetchHTML }) => {
  /**
   * @param {object} opts
   * @param {string} opts.name - Provider identifier used in logs and metrics.
   * @param {(input: string) => string | Promise<string>} opts.url - Builds the URL to fetch for a given input.
   * @param {($: cheerio.CheerioAPI) => string | symbol | undefined} opts.getter
   *   Extracts the avatar URL from the fetched HTML.
   *   - `string`     — avatar URL found (success).
   *   - `NOT_FOUND`  — provider-level miss.
   *   - `undefined`  — avatar not found (normal failure, no retry).
   * @param {() => object} [opts.htmlOpts] - Returns extra options merged into the fetch call.
   */
  const createHtmlProvider = ({ name, url, getter, htmlOpts }) => {
    const provider = async function (input, context) {
      const providerUrl = await url(input)

      const attempt = async gotOpts => {
        const providerOpts = htmlOpts?.() ?? {}
        const defaultOpts = {
          ...providerOpts,
          headers: {
            'user-agent': randomCrawlerAgent(),
            ...providerOpts.headers
          },
          timeout: PROXY_TIMEOUT
        }
        const fetchOpts = gotOpts ? { ...defaultOpts, ...gotOpts } : defaultOpts
        const tier = fetchOpts.tier ?? 'origin'

        const log = debug.duration({ provider: name, input, providerUrl, tier })

        const { $, statusCode, headers: responseHeaders = {} } = await getHTML(
          providerUrl,
          fetchOpts
        )

        attempt.lastHtml =
          typeof $ === 'function' && typeof $.html === 'function'
            ? $.html()
            : undefined
        attempt.lastHeaders = responseHeaders
        attempt.lastStatusCode = statusCode

        if (isStatusCodeMissing(statusCode)) {
          const code = EMPTY_PROVIDER_VALUE_CODE.MISSING_STATUS_CODE
          log.error({ statusCode, status: code })
          throw createProviderError({
            provider: name,
            statusCode,
            cause: {
              html: attempt.lastHtml,
              headers: responseHeaders,
              statusCode
            },
            code
          })
        }

        const result = getter($)
        if (statusCode === httpStatus.NOT_FOUND) {
          log.error({ statusCode, status: 'not_found' })
          return NOT_FOUND
        }

        const createEmptyGetterResultError = () =>
          createProviderError({
            provider: name,
            statusCode,
            code: EMPTY_PROVIDER_VALUE_CODE.EMPTY_GETTER_RESULT,
            cause: {
              html: attempt.lastHtml,
              headers: responseHeaders,
              statusCode
            }
          })

        const getBlockedStatus = () => {
          const isRateLimited = statusCode === httpStatus.TOO_MANY_REQUESTS

          const { detected: antibotDetected, provider: antibotProvider } =
            isRateLimited
              ? { detected: false, provider: null }
              : isAntibot({
                url: providerUrl,
                statusCode,
                headers: responseHeaders,
                body: attempt.lastHtml
              })

          return {
            isBlocked: isRateLimited || antibotDetected,
            antibotProvider
          }
        }

        if (typeof result === 'string' && result !== '') {
          const normalizedResult = normalizeUrl(providerUrl, result)
          log({
            statusCode,
            status: 'success',
            result: normalizedResult
          })
          return normalizedResult
        }

        // Some providers encode not-found via getter output. Check antibot
        // first so challenge pages are retried as blocked, not treated as 404.
        const { isBlocked: shouldMarkBlocked, antibotProvider } =
          getBlockedStatus()

        if (shouldMarkBlocked) {
          const error = createEmptyGetterResultError()
          error.blocked = true

          log.error({
            statusCode,
            status: 'blocked',
            antibot: antibotProvider ?? undefined,
            userAgent: fetchOpts.headers['user-agent']
          })

          throw error
        }

        if (result === NOT_FOUND) {
          log.error({ statusCode, status: 'not_found' })
          return NOT_FOUND
        }

        const error = createEmptyGetterResultError()

        log.error({
          statusCode,
          antibot: antibotProvider ?? undefined,
          userAgent: fetchOpts.headers['user-agent']
        })

        throw error
      }

      if (typeof onFetchHTML === 'function') {
        return onFetchHTML({ ...context, attempt, provider: name, providerUrl })
      }

      const result = await attempt()
      if (result === NOT_FOUND) return
      return result
    }

    provider.getUrl = url
    return provider
  }

  return { createHtmlProvider, getOgImage, NOT_FOUND }
}

module.exports.NOT_FOUND = NOT_FOUND
