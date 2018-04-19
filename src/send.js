'use strict'

const got = require('got')

const sendAvatar = ({ url, res }) => {
  const stream = got.stream(url)
  stream.on('response', resAvatar =>
    res.set('Content-Type', resAvatar.headers['content-type'])
  )
  return stream.pipe(res)
}

const send = ({ url, req, res, isJSON, isError }) => {
  res.status(isError ? 404 : 200)
  return isJSON ? res.json({ url }) : sendAvatar({ res, url })
}

module.exports = send
