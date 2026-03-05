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
        'GET /:provider/:key — resolve avatar for a specific provider',
        'GET /:key           — auto-resolve by input type (email, domain, username)'
      ]
    })
  }

  try {
    let result

    if (segments.length === 2) {
      // GET /:provider/:key
      const [providerName, key] = segments
      if (!unavatar[providerName]) {
        return sendJSON(res, 404, { error: `Unknown provider: ${providerName}` })
      }
      result = await unavatar[providerName](key)
    } else {
      // GET /:key — auto-resolve
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
  console.log(`  curl -L http://localhost:${PORT}/github/kikobeats`)
  console.log(`  curl    http://localhost:${PORT}/github/kikobeats?json`)
  console.log(`  curl    http://localhost:${PORT}/hello@microlink.io?json`)
})
