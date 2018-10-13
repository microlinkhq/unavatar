'use strict'

const { get } = require('lodash')
const got = require('got')

const sendAvatar = ({ url, res, isError }) => {
  if (isError) return res.send()

  const stream = got.stream(url)
  stream.on('response', resAvatar =>
    res.set('Content-Type', get(resAvatar, 'headers.content-type'))
  )
  stream.on('error', () => res.status(404))
  return stream.pipe(res)
}

const send = ({ url, res, isJSON, isError }) => {
  res.status(isError ? 404 : 200)
  return isJSON ? res.json({ url }) : sendAvatar({ res, url, isError })
}

module.exports = send
