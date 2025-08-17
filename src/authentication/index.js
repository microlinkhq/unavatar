'use strict'

const timeSpan = require('@kikobeats/time-span')({ format: require('ms') })
const debug = require('debug-logfmt')('unavatar:authentication')
const FrequencyCounter = require('frequency-counter')
const onFinished = require('on-finished')
const os = require('os')

const duration = timeSpan()
const reqsMin = new FrequencyCounter(60)
let reqsCounter = 0

const more = (() => {
  const email = 'hello@microlink.io'
  const subject = encodeURIComponent('[unavatar] Buy an API key')
  const body = encodeURIComponent(
    'Hello,\nI want to buy an unavatar.sh API key. Please tell me how to proceed.'
  )
  return `mailto:${email}?subject=${subject}&body=${body}`
})()

const rateLimitError = ({ code, statusCode, message }) => {
  const rateLimitError = new Error(
    JSON.stringify({
      status: 'fail',
      code,
      more,
      message
    })
  )
  rateLimitError.statusCode = statusCode
  rateLimitError.headers = { 'Content-Type': 'application/json' }
  return rateLimitError
}

module.exports = async (req, res, next) => {
  ++reqsCounter && reqsMin.inc()
  onFinished(res, () => --reqsCounter)

  const apiKey = req.headers['x-api-key']

  if (apiKey && !(await require('./paid').hasKey(apiKey))) {
    return next(
      rateLimitError({
        code: 'EAPIKEY',
        statusCode: 401,
        message: 'Invalid API key'
      })
    )
  }

  const { token, rateLimiter } = apiKey
    ? { token: apiKey, rateLimiter: require('./paid') }
    : { token: req.ipAddress, rateLimiter: require('./free') }

  const usage = await rateLimiter(token)

  if (!res.writableEnded) {
    res.setHeader('X-Rate-Limit-Limit', usage.limit)
    res.setHeader('X-Rate-Limit-Remaining', usage.remaining)
    res.setHeader('X-Rate-Limit-Reset', usage.reset)

    const perMinute = reqsMin.freq()
    const perSecond = Number(perMinute / 60).toFixed(1)

    debug(req.ipAddress, {
      uptime: duration(),
      load: os.loadavg().map(n => n.toFixed(2)),
      reqs: reqsCounter,
      'req/m': perMinute,
      'req/s': perSecond,
      quota: `${usage.remaining}/${usage.limit}`
    })
  }

  if (usage.remaining) return next()

  const retryAfterSec = Math.max(
    0,
    Math.ceil((usage.reset - Date.now()) / 1000)
  )
  res.setHeader('Retry-After', retryAfterSec.toString()) // seconds

  return next(
    rateLimitError({
      code: 'ERATE',
      statusCode: 429,
      message:
        'Your daily rate limit has been reached. You need to wait or buy a plan.'
    })
  )
}
