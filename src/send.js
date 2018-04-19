'use strict'

const got = require('got')

const sendAvatar = ({ url, res }) => {
  const stream = got.stream(url)
  stream.on('response', resAvatar =>
    res.set('Content-Type', resAvatar.headers['content-type'])
  )
  return stream.pipe(res)
}

const sendError = ({ url, req, res, isJSON }) => {
  return isJSON ? res.json({ url }) : res.status(404).send()
}

const sendSuccess = ({ url, req, res, isJSON }) => {
  return isJSON ? res.json({ url }) : sendAvatar({ res, url })
}

const send = ({ url, req, res, isJSON, isError }) => {
  const sendMethod = isError ? sendError : sendSuccess
  return sendMethod({ url, req, res, isJSON, isError })
}

module.exports = send
