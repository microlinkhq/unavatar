'use strict'

const { mkdir, writeFile } = require('fs/promises')
const { normalizeUrl } = require('@metascraper/helpers')
const debug = require('debug-logfmt')('html-provider')
const path = require('path')

const httpStatus = require('./http-status')
const ExtendableError = require('./error')

const HTML_DEBUG_DIR = '/tmp/html'

const isStatusCodeMissing = statusCode =>
  statusCode === undefined || statusCode === null || statusCode === ''

const createEmptyProviderValueError = ({ provider, statusCode }) =>
  new ExtendableError({
    provider,
    statusCode,
    message: 'Empty value returned by the provider.'
  })

const NOT_FOUND = Symbol('NOT_FOUND')

const UNRESOLVED = Symbol('UNRESOLVED')

const getOgImage = $ => $('meta[property="og:image"]').attr('content')

const sanitizeFileToken = input =>
  String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown'

const writeHtmlDebugFile = async ({ debugEnabled, provider, tier, requestId, html }) => {
  if (!debugEnabled || typeof html !== 'string' || html === '') return

  const fileName = `${sanitizeFileToken(provider)}-${sanitizeFileToken(tier)}-${sanitizeFileToken(
    requestId
  )}.html`
  const filePath = path.join(HTML_DEBUG_DIR, fileName)
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, html, 'utf8')

  return filePath
}

const getHtmlDebugInfo = async $ => {
  if (typeof $ !== 'function') return {}

  const html = typeof $.html === 'function' ? $.html() : ''

  return {
    html,
    htmlLength: html.length
  }
}

module.exports = ({ PROXY_TIMEOUT, DEBUG_HTML_TO_FILE, getHTML }) => {
  const createHtmlProvider = ({ name, url, getter, htmlOpts }) => {
    const provider = async function ({ input, opts, req = {}, res = {} }) {
      const providerUrl = await url(input)
      const context = { provider: name, input, providerUrl }

      const forceProxy = req.query?.proxy === true && typeof opts === 'function'

      const logProviderError = payload => debug.error({ ...context, ...payload })

      const logProviderLookup = payload => debug({ ...context, ...payload })

      const getResult = async ($, statusCode, log, tier) => {
        const result = getter($)
        if (typeof result !== 'string' || result === '') {
          let htmlDebugInfo = {}

          if (DEBUG_HTML_TO_FILE) {
            const { html, ...info } = await getHtmlDebugInfo($)
            const requestId = typeof res.getHeader === 'function'
              ? res.getHeader('x-request-id')
              : undefined
            const htmlFile = await writeHtmlDebugFile({
              debugEnabled: true,
              provider: name,
              tier,
              requestId,
              html
            }).catch(() => undefined)
            htmlDebugInfo = { ...info, ...(htmlFile ? { htmlFile } : {}) }
          }

          log.error({
            statusCode,
            ...htmlDebugInfo
          })

          throw createEmptyProviderValueError({ provider: name, statusCode })
        }
        const normalizedResult = normalizeUrl(providerUrl, result)
        log({
          statusCode,
          status: 'success',
          result: normalizedResult
        })
        return normalizedResult
      }

      const reportSuccess = (requestType, result) => {
        if (typeof res.setHeader === 'function') {
          res.setHeader('x-proxy-tier', requestType)
        }
        return result
      }

      const getResultOrUndefined = async ({
        tier,
        resolve,
        onError
      } = {}) => {
        const log = debug.duration({ ...context, tier })
        try {
          return await resolve(log)
        } catch (error) {
          if (error?.provider !== name && error?.name !== 'TimeoutError') {
            logProviderError({ tier, status: 'failed', message: error.message })
          }
          onError?.(error)
          return UNRESOLVED
        }
      }

      const getProxyResultOrUndefined = async ({ superProxy = false } = {}) => {
        const tier = superProxy ? 'residential' : 'datacenter'
        return getResultOrUndefined({
          tier,
          resolve: async log => {
            const { $, statusCode } = await getHTML(
              providerUrl,
              await opts(providerUrl, { superProxy, timeout: PROXY_TIMEOUT })
            )
            return getResult($, statusCode, log, tier)
          }
        })
      }

      const getOriginResultOrUndefined = () =>
        getResultOrUndefined({
          tier: 'origin',
          resolve: async log => {
            const { $, statusCode } = await getHTML(providerUrl, {
              ...htmlOpts?.(),
              timeout: PROXY_TIMEOUT
            })

            if (isStatusCodeMissing(statusCode)) {
              log.error({ statusCode, status: 'missing_status_code' })
              return UNRESOLVED
            }

            if (statusCode === httpStatus.NOT_FOUND) {
              log.error({ statusCode, status: 'not_found' })
              return NOT_FOUND
            }

            return getResult($, statusCode, log, 'origin')
          }
        })

      if (forceProxy) {
        logProviderLookup({ tier: 'origin', status: 'skipped', reason: 'force_proxy' })
      }

      if (!forceProxy) {
        const resultOrigin = await getOriginResultOrUndefined()
        if (resultOrigin === NOT_FOUND) return
        if (resultOrigin !== UNRESOLVED) return reportSuccess('origin', resultOrigin)
      }

      if (typeof opts !== 'function') return

      const resultDatacenter = await getProxyResultOrUndefined()
      if (resultDatacenter !== UNRESOLVED) return reportSuccess('datacenter', resultDatacenter)

      const resultResidential = await getProxyResultOrUndefined({ superProxy: true })
      if (resultResidential === UNRESOLVED) return

      return reportSuccess('residential', resultResidential)
    }

    return provider
  }

  return { createHtmlProvider, getOgImage }
}
