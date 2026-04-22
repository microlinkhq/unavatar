'use strict'

const { createServer } = require('http')

const unavatar = require('@unavatar/core')()

const PORT = process.env.PORT || 3000

const sendJSON = (res, statusCode, body) => {
  res.writeHead(statusCode, { 'content-type': 'application/json' })
  res.end(JSON.stringify(body))
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const segments = url.pathname.split('/').filter(Boolean)

  // GET / — list providers and routes
  if (segments.length === 0) {
    return sendJSON(res, 200, {
      providers: Object.keys(unavatar.providers),
      routes: [
        'GET /email/:key     — resolve using email providers',
        'GET /domain/:key    — resolve using domain providers'
      ]
    })
  }

  try {
    let result

    if (segments.length === 2) {
      const [providerName, key] = segments
      if (!unavatar[providerName]) {
        return sendJSON(res, 404, { error: `Unknown provider: ${providerName}` })
      }
      result = await unavatar[providerName](key)
    } else {
      const [key] = segments
      result = await unavatar(key)
    }

    if (!result) return sendJSON(res, 404, { url: null })

    // ?json returns the avatar metadata instead of redirecting
    if (url.searchParams.has('json')) {
      return sendJSON(res, 200, {
        url: result.data,
        type: result.type,
        provider: result.provider
      })
    }

    // Default: redirect to the avatar URL
    res.writeHead(302, { location: result.data })
    res.end()
  } catch (error) {
    const statusCode = error.statusCode || 500
    sendJSON(res, statusCode, { error: error.message })
  }
})

server.listen(PORT, () => {
  console.log(`unavatar server listening on http://localhost:${PORT}`)
  console.log()
  console.log('Try:')
  console.log(`  curl    http://localhost:${PORT}/email/hello@microlink.io?json`)
  console.log(`  curl    http://localhost:${PORT}/domain/reddit.com?json`)
})
