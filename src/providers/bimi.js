'use strict'

const createGetLogo = require('bimi-url')
const isEmail = require('is-email-like')

const toDomain = input =>
  isEmail(input) ? input.slice(input.lastIndexOf('@') + 1) : input

module.exports = ({ bimiCache, dnsResolver, got, isReservedIp }) => {
  const getLogo = createGetLogo({
    gotOpts: got.gotOpts,
    keyvOpts: bimiCache,
    resolveTxt: hostname => dnsResolver.resolveTxt(hostname)
  })

  return async function bimi (input) {
    const logoUrl = await getLogo(toDomain(input))
    if (!logoUrl) return undefined
    return (await isReservedIp(new URL(logoUrl).hostname)) ? undefined : logoUrl
  }
}

module.exports.toDomain = toDomain
