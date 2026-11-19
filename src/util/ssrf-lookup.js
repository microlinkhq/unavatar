'use strict'

const { RESERVED_ADDRESS_CODE, isReservedAddress } = require('./is-reserved-ip')

const createReservedAddressError = hostname =>
  Object.assign(
    new Error(`Refusing to request a reserved address: ${hostname}`),
    { code: RESERVED_ADDRESS_CODE }
  )

const createNotFoundError = hostname =>
  Object.assign(new Error(`getaddrinfo ENOTFOUND ${hostname}`), {
    code: 'ENOTFOUND',
    hostname
  })

const toFamily = (address, declared) => {
  if (declared === 4 || declared === 6) return declared
  return address.includes(':') ? 6 : 4
}

const toEntries = (result, family) => {
  const answers = Array.isArray(result) ? result : [result]
  const entries = []
  for (const answer of answers) {
    const address = typeof answer === 'string' ? answer : answer?.address
    if (typeof address !== 'string' || address === '') continue
    const declared =
      typeof answer === 'string' ? family : answer.family ?? family
    entries.push({ address, family: toFamily(address, declared) })
  }
  return entries
}

const toLookupOptions = options => {
  if (typeof options === 'number') return { family: options }
  if (options === null || typeof options !== 'object') return {}
  return options
}

const createSsrfLookup = lookup => {
  const ssrfLookup = (hostname, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }
    const { family: wantedFamily, all } = toLookupOptions(options)

    let settled = false
    const done = (error, ...args) => {
      if (settled) return
      settled = true
      callback(error, ...args)
    }

    const decide = (error, result, family) => {
      if (error) return done(error)

      const entries = toEntries(result, family)
      if (entries.length === 0) return done(createNotFoundError(hostname))
      if (entries.some(entry => isReservedAddress(entry.address))) {
        return done(createReservedAddressError(hostname))
      }

      const picked =
        wantedFamily === 4 || wantedFamily === 6
          ? entries.filter(entry => entry.family === wantedFamily)
          : entries
      if (picked.length === 0) return done(createNotFoundError(hostname))
      if (all) return done(null, picked)
      return done(null, picked[0].address, picked[0].family)
    }

    let isSync = true
    let syncAnswer
    try {
      lookup(hostname, { all: true }, (error, result, family) => {
        if (isSync) {
          syncAnswer ??= [error, result, family]
          return
        }
        decide(error, result, family)
      })
    } catch (error) {
      syncAnswer ??= [error]
    }
    isSync = false
    if (syncAnswer) decide(...syncAnswer)
  }

  return ssrfLookup
}

module.exports = { createSsrfLookup, createReservedAddressError }
