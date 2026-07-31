'use strict'

const createGetLogo = require('bimi-url')

const parseInput = input => input.slice(input.lastIndexOf('@') + 1)

const hostnameOf = url => {
  try {
    return new URL(url).hostname
  } catch {
    return undefined
  }
}

module.exports = ({ bimiCache, dnsResolver, got, isReservedIp }) => {
  const resolveLogoUrl = async (logoUrl, gotOpts) => {
    const hostname = hostnameOf(logoUrl)
    if (!hostname || (await isReservedIp(hostname))) return undefined

    const response = await createGetLogo.resolveLogoUrl(logoUrl, gotOpts)

    const finalHostname = hostnameOf(response)
    if (finalHostname && (await isReservedIp(finalHostname))) return undefined

    return response
  }

  const getLogo = createGetLogo({
    gotOpts: got.gotOpts,
    keyvOpts: bimiCache,
    resolveTxt: hostname => dnsResolver.resolveTxt(hostname),
    resolveLogoUrl
  })

  return async function bimi (input) {
    return getLogo(parseInput(input))
  }
}

module.exports.parseInput = parseInput
