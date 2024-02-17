'use strict'

const timeSpan = require('@kikobeats/time-span')({ format: require('ms') })
const debug = require('debug-logfmt')('unavatar:authentication')
const { RateLimiterMemory } = require('rate-limiter-flexible')
const FrequencyCounter = require('frequency-counter')
const onFinished = require('on-finished')
const os = require('os')

const duration = timeSpan()
const reqsMin = new FrequencyCounter(60)
let reqs = 0

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
  ++reqs && reqsMin.inc()
  onFinished(res, () => --reqs)

  if (req.headers['x-api-key'] === API_KEY) return next()

  const { msBeforeNext, remainingPoints: quotaRemaining } = await rateLimiter
    .consume(req.ipAddress)
    .catch(error => error)

  if (!res.writableEnded) {
    res.setHeader('X-Rate-Limit-Limit', RATE_LIMIT)
    res.setHeader('X-Rate-Limit-Remaining', quotaRemaining)
    res.setHeader('X-Rate-Limit-Reset', new Date(Date.now() + msBeforeNext))

    const perMinute = reqsMin.freq()
    const perSecond = Number(perMinute / 60).toFixed(1)

    debug(req.ipAddress, {
      uptime: duration(),
      load: os.loadavg().map(n => n.toFixed(2)),
      reqs,
      'req/m': perMinute,
      'req/s': perSecond,
      quotaTotal: RATE_LIMIT,
      quotaRemaining
    })
  }

  if (quotaRemaining) return next()
  res.setHeader('Retry-After', msBeforeNext / 1000)
  return next(rateLimitError)
}
