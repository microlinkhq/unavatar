'use strict'

const { RateLimiterMemory } = require('rate-limiter-flexible')
const debug = require('debug-logfmt')('unavatar:rate')

const { API_KEY, RATE_LIMIT_WINDOW, RATE_LIMIT } = require('./constant')

const rateLimiter = new RateLimiterMemory({
  points: RATE_LIMIT,
  duration: RATE_LIMIT_WINDOW
})

const more = (() => {
  const email = 'hello@microlink.io'
  const subject = encodeURIComponent('[unavatar] Buy an API key')
  const body = encodeURIComponent(
    'Hello,\nI want to buy an unavatar.sh API key. Please tell me how to proceed.'
  )
  return `mailto:${email}?subject=${subject}&body=${body}`
})()

const rateLimitError = (() => {
  const rateLimitError = new Error(
    JSON.stringify({
      status: 'fail',
      code: 'ERATE',
      more,
      message:
        'Your daily rate limit has been reached. You need to wait or buy a plan.'
    })
  )

  rateLimitError.statusCode = 429
  rateLimitError.headers = { 'Content-Type': 'application/json' }
  return rateLimitError
})()

module.exports = async (req, res, next) => {
  if (req.headers['x-api-key'] === API_KEY) return next()

  const { msBeforeNext, remainingPoints: remaining } = await rateLimiter
    .consume(req.ipAddress)
    .catch(error => error)

  if (!res.writableEnded) {
    res.setHeader('X-Rate-Limit-Limit', RATE_LIMIT)
    res.setHeader('X-Rate-Limit-Remaining', remaining)
    res.setHeader('X-Rate-Limit-Reset', new Date(Date.now() + msBeforeNext))
    debug(req.ipAddress, { total: RATE_LIMIT, remaining })
  }

  if (remaining) return next()
  res.setHeader('Retry-After', msBeforeNext / 1000)
  return next(rateLimitError)
}
