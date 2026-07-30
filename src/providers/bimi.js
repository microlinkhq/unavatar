'use strict'

const createGetLogo = require('bimi-url')

const parseInput = input => input.slice(input.lastIndexOf('@') + 1)

module.exports = ({ bimiCache, dnsResolver, got, isReservedIp }) => {
  const getLogo = createGetLogo({
    gotOpts: got.gotOpts,
    keyvOpts: bimiCache,
    resolveTxt: hostname => dnsResolver.resolveTxt(hostname)
  })

  return async function bimi (input) {
    const logoUrl = await getLogo(parseInput(input))
    if (!logoUrl) return undefined
    if (await isReservedIp(new URL(logoUrl).hostname)) return undefined
    return logoUrl
  }
}

module.exports.parseInput = parseInput
