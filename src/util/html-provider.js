'use strict'

const { normalizeUrl } = require('@metascraper/helpers')
const debug = require('debug-logfmt')('html-provider')
const isAntibot = require('is-antibot')

const randomCrawlerAgent = require('./crawler-agent')
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

const getOgImage = $ =>
  $('meta[property="og:image"]').attr('content') ||
  $('meta[name="og:image"]').attr('content')

module.exports = ({ PROXY_TIMEOUT, getHTML, onFetchHTML }) => {
  /**
   * @param {object} opts
   * @param {string} opts.name - Provider identifier used in logs and metrics.
   * @param {(input: string) => string | Promise<string>} opts.url - Builds the URL to fetch for a given input.
   * @param {($: cheerio.CheerioAPI) => string | undefined} opts.getter
   *   Extracts the avatar URL from the fetched HTML.
   *   - `string`    — avatar URL found (success).
   *   - `undefined`  — avatar not found (normal failure, no retry).
   * @param {(context: { $: cheerio.CheerioAPI, statusCode: number }) => boolean} [opts.isBlocked]
   *   Optional provider-specific blocked-page detector, checked after the
   *   default `is-antibot` check when getter returns empty/undefined.
   * @param {() => object} [opts.htmlOpts] - Returns extra options merged into the fetch call.
   */
  const createHtmlProvider = ({ name, url, getter, isBlocked, htmlOpts }) => {
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

        const {
          $,
          statusCode,
          headers: responseHeaders = {}
        } = await getHTML(providerUrl, fetchOpts)

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

        if (statusCode === httpStatus.NOT_FOUND) {
          log.error({ statusCode, status: 'not_found' })
          return NOT_FOUND
        }

        const result = getter($)
        if (typeof result !== 'string' || result === '') {
          const error = createProviderError({
            provider: name,
            statusCode,
            code: EMPTY_PROVIDER_VALUE_CODE.EMPTY_GETTER_RESULT,
            cause: {
              html: attempt.lastHtml,
              headers: responseHeaders,
              statusCode
            }
          })

          const isRateLimited = statusCode === httpStatus.TOO_MANY_REQUESTS
          const providerBlocked = isBlocked?.({ $, statusCode })

          const { detected: antibotDetected, provider: antibotProvider } =
            isRateLimited || providerBlocked
              ? { detected: false, provider: null }
              : isAntibot({
                url: providerUrl,
                headers: responseHeaders,
                body: attempt.lastHtml
              })

          if (isRateLimited || providerBlocked || antibotDetected) {
            error.blocked = true
          }

          log.error({
            statusCode,
            status: error.blocked ? 'blocked' : undefined,
            antibot: antibotProvider ?? undefined,
            userAgent: fetchOpts.headers['user-agent']
          })

          throw error
        }

        const normalizedResult = normalizeUrl(providerUrl, result)
        log({
          statusCode,
          status: 'success',
          result: normalizedResult
        })
        return normalizedResult
      }

      if (typeof onFetchHTML === 'function') {
        return onFetchHTML({ ...context, attempt, provider: name, providerUrl })
      }

      const result = await attempt()
      if (result === NOT_FOUND) return undefined
      return result
    }

    provider.getUrl = url
    return provider
  }

  return { createHtmlProvider, getOgImage, NOT_FOUND }
}

module.exports.NOT_FOUND = NOT_FOUND
