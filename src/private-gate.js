'use strict'

// Private access gate for Brillo's self-hosted instance.
//
// When UNAVATAR_KEY is set, every avatar request must carry the same secret —
// as `?key=<value>` or the `x-unavatar-key` header — otherwise it gets 403.
// `/` and `/ping` stay open so Fly health checks and the landing page keep
// working. If UNAVATAR_KEY is unset the instance stays fully open (local dev).
const ACCESS_KEY = process.env.UNAVATAR_KEY
const OPEN_PATHS = new Set(['/', '/ping'])

module.exports = (req, res, next) => {
  if (!ACCESS_KEY) return next()

  const url = new URL(req.url, 'http://localhost')
  if (OPEN_PATHS.has(url.pathname)) return next()

  const provided = req.headers['x-unavatar-key'] || url.searchParams.get('key')
  if (provided === ACCESS_KEY) return next()

  res.statusCode = 403
  res.setHeader('content-type', 'application/json')
  return res.end(
    JSON.stringify({ status: 'fail', code: 'EFORBIDDEN', message: 'Forbidden' })
  )
}
