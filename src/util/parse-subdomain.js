'use strict'

const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i

module.exports = input =>
  typeof input === 'string' && SUBDOMAIN_REGEX.test(input)
    ? input.toLowerCase()
    : undefined
