'use strict'

const { AsyncLocalStorage } = require('async_hooks')
const { randomUUID } = require('crypto')

const asyncLocalStorage = new AsyncLocalStorage()

const overrideWrite = stream => {
  const originalWrite = stream.write
  stream.write = function (data) {
    originalWrite.call(stream, `${getUUID()} ${data}`)
  }
}

overrideWrite(process.stderr)
overrideWrite(process.stdout)

const getUUID = () => asyncLocalStorage.getStore()

const withUUID = fn => asyncLocalStorage.run(randomUUID(), fn)

module.exports = { getUUID, withUUID }
