'use strict'

const PCancelable = require('p-cancelable')
const mql = require('@microlink/mql')
const { get } = require('lodash')

module.exports = ({ constants }) =>
  PCancelable.fn(async function microlink ({ input, req = {} }, onCancel) {
    const promise = mql(`https://${input}`, {
      apiKey: req.isPro ? constants.MICROLINK_API_KEY : req.headers?.['x-api-key']
    })
    onCancel(() => promise.onCancel())
    const { data } = await promise
    return get(data, 'logo.url')
  })
