'use strict'

const isEmail = require('is-email-like')
const aigle = require('aigle')
const got = require('got')

const { services, servicesBy } = require('./services')
const send = require('./send')

const getAvatarUrl = key => {
  const collection = isEmail(key) ? servicesBy.email : servicesBy.username
  return aigle
    .resolve(collection)
    .map(service => services[service](key))
    .find(url => got.head(url))
}

const createGetAvatarUrl = ({
  urlFn = getAvatarUrl,
  isJSON = false
} = {}) => async (req, res) => {
  const { key } = req.params
  let url = null

  try {
    url = await urlFn(key)
  } catch (err) {}

  return send({ url, req, res, isJSON, key, isError: url === null })
}

module.exports = {
  getAvatarUrl,
  createGetAvatarUrl
}
