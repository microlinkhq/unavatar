'use strict'

const { default: termImg } = require('term-img')
const { STATUS_CODES } = require('http')
const got = require('got')
const mri = require('mri')

module.exports = ({ baseUrl }) => {
  const { _, ...flags } = mri(process.argv.slice(2), {
    default: { apiKey: process.env.UNAVATAR_API_KEY },
    alias: { H: 'header' }
  })

  const input = _.join(' ')

  const parseHeaders = raw => {
    const entries = raw == null ? [] : Array.isArray(raw) ? raw : [raw]
    return entries.reduce((headers, entry) => {
      const idx = entry.indexOf(':')
      if (idx === -1) return headers
      const name = entry.slice(0, idx).trim()
      const value = entry.slice(idx + 1).trim()
      if (name) headers[name.toLowerCase()] = value
      return headers
    }, {})
  }

  const customHeaders = parseHeaders(flags.header)

  if (!input) {
    console.error(
      'Usage: unavatar <input> | unavatar <provider>/<key> | unavatar ping'
    )
    console.error(
      'Examples: unavatar reddit.com | unavatar hello@microlink.io | unavatar x/kikobeats | unavatar ping'
    )
    process.exit(1)
  }

  const isPing = input.toLowerCase() === 'ping'
  const normalizeInput = value => {
    try {
      const url = new URL(value)
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return url.hostname
      }
    } catch (_) {}
    return value
  }

  const resolvedInput = isPing ? input : normalizeInput(input)

  const apiUrl = isPing
    ? new URL('/ping', baseUrl)
    : (() => {
        const hasProviderFormat = resolvedInput.includes('/')
        let url

        if (hasProviderFormat) {
          const [provider, ...keyParts] = resolvedInput.split('/')
          const key = keyParts.join('/')

          if (!provider || !key) {
            console.error(
              'Invalid input format. Expected: <input>, <provider>/<key>, or "ping"'
            )
            console.error(
              'Examples: unavatar reddit.com | unavatar hello@microlink.io | unavatar x/kikobeats | unavatar ping'
            )
            process.exit(1)
          }

          url = new URL(`/${provider}/${key}`, baseUrl)
        } else {
          url = new URL(`/${resolvedInput}`, baseUrl)
        }

        url.searchParams.set('json', 'true')
        return url
      })()

  const startTime = Date.now()

  let durationInfo = null
  let apiHeaders = null
  let apiStatusCode = null
  let apiHttpVersion = null

  const logMeta = () => {
    if (apiHeaders) {
      const headerEntries = Object.entries(apiHeaders)
      if (headerEntries.length > 0) {
        const maxHeaderLength = Math.max(
          ...headerEntries.map(([key]) => key.toLowerCase().length)
        )

        console.error()
        console.error(
          `HTTP/${apiHttpVersion || '1.1'} ${apiStatusCode} ${
            STATUS_CODES[apiStatusCode]
          }`
        )
        headerEntries
          .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
          .forEach(([key, value]) => {
            const paddedKey = key.toLowerCase().padEnd(maxHeaderLength)
            console.error(`${paddedKey}: ${value}`)
          })
      }
    }

    if (durationInfo) {
      console.error()
      console.error(durationInfo)
    }
  }

  const requestHeaders = { ...customHeaders }
  if (flags.apiKey) requestHeaders['x-api-key'] = flags.apiKey

  got(apiUrl.toString(), { headers: requestHeaders, responseType: 'json' })
    .then(({ body, headers, statusCode, timings, httpVersion }) => {
      apiHeaders = headers
      apiStatusCode = statusCode
      apiHttpVersion = httpVersion

      const duration = Date.now() - startTime
      const timeToFirstByte =
        timings?.response && timings?.start
          ? Math.round(timings.response - timings.start)
          : null

      durationInfo = timeToFirstByte
        ? `Duration: ${duration}ms (TTFB: ${timeToFirstByte}ms)`
        : `Duration: ${duration}ms`

      if (isPing) {
        console.error()
        console.error(`${apiUrl.toString()}\n`)
        console.error(body)
        logMeta()
        return
      }

      if (!body || !body.url) {
        console.error('No avatar URL found')
        process.exit(1)
      }

      return got(body.url, { responseType: 'buffer' }).then(result => ({
        buffer: result.body,
        imageUrl: body.url
      }))
    })
    .then(({ buffer, imageUrl }) => {
      console.error()
      console.error(termImg(buffer, { width: '15%' }))

      console.error(`
 input: ${apiUrl.toString()}
output: ${imageUrl}
      `)

      logMeta()
    })
    .catch(error => {
      const response = error?.response
      if (response) {
        apiHeaders = response.headers
        apiStatusCode = response.statusCode
        apiHttpVersion = response.httpVersion
      }

      if (!durationInfo) {
        const duration = Date.now() - startTime
        durationInfo = `Duration: ${duration}ms`
      }

      const body = response?.body
      if (body !== undefined) {
        console.error()

        if (typeof body === 'object') {
          console.error(JSON.stringify(body, null, 2))
        } else {
          const rawBody = Buffer.isBuffer(body)
            ? body.toString('utf8')
            : String(body)
          try {
            console.error(JSON.stringify(JSON.parse(rawBody), null, 2))
          } catch (_) {
            console.error(rawBody)
          }
        }
      }

      logMeta()
      process.exit(1)
    })
}
