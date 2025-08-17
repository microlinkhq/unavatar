'use strict'

const PCancelable = require('p-cancelable')
const mql = require('@microlink/mql')
const { get } = require('lodash')

module.exports = PCancelable.fn(async function microlink (
  { input, req },
  onCancel
) {
  const promise = mql(`https://${input}`, {
    apiKey: req.headers?.['x-api-key']
  })
  onCancel(() => promise.onCancel())
  const { data } = await promise
  return get(data, 'logo.url')
})

module.exports.supported = {
  email: false,
  username: false,
  domain: true
}
