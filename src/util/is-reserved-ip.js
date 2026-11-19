'use strict'

const ip = require('ipaddr.js')

const RESERVED_ADDRESS_CODE = 'ERESERVEDADDRESSRANGE'

const IPV4_COMPATIBLE_IPV6 = ip.parseCIDR('::/96')

const isIpv4CompatibleIpv6 = parsed =>
  parsed.kind() === 'ipv6' && parsed.match(IPV4_COMPATIBLE_IPV6)

const isReservedAddress = address => {
  try {
    const parsed = ip.process(address)
    return parsed.range() !== 'unicast' || isIpv4CompatibleIpv6(parsed)
  } catch {
    return true
  }
}

const unbracket = hostname =>
  hostname.startsWith('[') && hostname.endsWith(']')
    ? hostname.slice(1, -1)
    : hostname

const literalAddresses = hostname => {
  if (typeof hostname !== 'string') return
  if (ip.IPv4.isValid(hostname)) return [hostname]
  const literal = unbracket(hostname)
  if (ip.IPv6.isValid(literal)) return [literal]
}

module.exports = ({ cacheableLookup }) => {
  const getIpAddresses = async hostname => {
    const literals = literalAddresses(hostname)
    if (literals) return literals
    const result = await cacheableLookup.lookupAsync(hostname, { all: true })
    return result.map(entry => entry.address)
  }

  return async hostname => {
    const addresses = await getIpAddresses(hostname)
    return addresses.some(isReservedAddress)
  }
}

module.exports.RESERVED_ADDRESS_CODE = RESERVED_ADDRESS_CODE
module.exports.isReservedAddress = isReservedAddress
module.exports.literalAddresses = literalAddresses
