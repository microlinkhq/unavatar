'use strict'

const { normalizeUrl } = require('@metascraper/helpers')
const debug = require('debug-logfmt')('html-provider')

const httpStatus = require('./http-status')
const ExtendableError = require('./error')

const NOT_FOUND = Symbol('NOT_FOUND')

const isStatusCodeMissing = statusCode =>
  statusCode === undefined || statusCode === null || statusCode === ''

const createEmptyProviderValueError = ({ provider, statusCode }) =>
  new ExtendableError({
    provider,
    statusCode,
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
   * @param {($: cheerio.CheerioAPI) => string | false | undefined} opts.getter
   *   Extracts the avatar URL from the fetched HTML.
   *   - `string`    — avatar URL found (success).
   *   - `undefined`  — avatar not found (normal failure, no retry).
   *   - `false`     — page is blocked; error.blocked will be set to true.
   * @param {() => object} [opts.htmlOpts] - Returns extra options merged into the fetch call.
   */
  const createHtmlProvider = ({ name, url, getter, htmlOpts }) => {
    const provider = async function ({ input, req = {}, res = {} }) {
      const providerUrl = await url(input)
      const context = { provider: name, input, providerUrl }

      const attempt = async gotOpts => {
        const defaultOpts = { ...htmlOpts?.(), timeout: PROXY_TIMEOUT }
        const fetchOpts = gotOpts ? { ...defaultOpts, ...gotOpts } : defaultOpts
        const tier = fetchOpts.tier ?? 'origin'

        const log = debug.duration({ ...context, tier })

        const { $, statusCode } = await getHTML(providerUrl, fetchOpts)

        attempt.lastHtml =
          typeof $ === 'function' && typeof $.html === 'function'
            ? $.html()
            : undefined

        if (isStatusCodeMissing(statusCode)) {
          log.error({ statusCode, status: 'missing_status_code' })
          throw createEmptyProviderValueError({ provider: name, statusCode })
        }

        if (statusCode === httpStatus.NOT_FOUND) {
          log.error({ statusCode, status: 'not_found' })
          return NOT_FOUND
        }

        const result = getter($)
        if (typeof result !== 'string' || result === '') {
          const error = createEmptyProviderValueError({
            provider: name,
            statusCode
          })
          error.html = attempt.lastHtml
          if (result === false) error.blocked = true

          log.error({ statusCode, status: result === false ? 'blocked' : undefined })

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
        return onFetchHTML({ attempt, provider: name, providerUrl, req, res })
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
