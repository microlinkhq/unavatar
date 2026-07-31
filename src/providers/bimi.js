'use strict'

const createGetLogo = require('bimi-url')

const parseInput = input => input.slice(input.lastIndexOf('@') + 1)

module.exports = ({ bimiCache, dnsResolver, got }) => {
  const getLogo = createGetLogo({
    gotOpts: got.gotOpts,
    keyvOpts: bimiCache,
    resolveTxt: hostname => dnsResolver.resolveTxt(hostname)
  })

  return function bimi (input) {
    return getLogo(parseInput(input))
  }
}

module.exports.parseInput = parseInput
