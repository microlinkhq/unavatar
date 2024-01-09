'use strict'

const debug = require('debug-logfmt')('req-frequency')
const FrequencyCounter = require('frequency-counter')
const onFinished = require('on-finished')

module.exports = server => {
  const min = new FrequencyCounter(60)
  let requests = 0
  const info = () => {
    const perMinute = min.freq()
    return { requests, perMinute, perSecond: Number(perMinute / 60).toFixed(1) }
  }
  server.on('request', (_, res) => {
    ++requests
    min.inc()
    debug(info())
    onFinished(res, () => --requests)
  })
  return info
}
