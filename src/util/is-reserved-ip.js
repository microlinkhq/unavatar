'use strict'

const ip = require('ipaddr.js')

const unbracket = hostname =>
  hostname.startsWith('[') && hostname.endsWith(']')
    ? hostname.slice(1, -1)
    : hostname

const isReservedAddress = address => ip.process(address).range() !== 'unicast'

module.exports = ({ cacheableLookup }) => {
  const getIpAddresses = async hostname => {
    if (ip.IPv4.isIPv4(hostname)) return [hostname]
    const literal = unbracket(hostname)
    if (ip.IPv6.isIPv6(literal)) return [literal]
    const result = await cacheableLookup.lookupAsync(hostname, { all: true })
    return result.map(entry => entry.address)
  }

  return async hostname => {
    const addresses = await getIpAddresses(hostname)
    return addresses.some(isReservedAddress)
  }
}

module.exports.RESERVED_ADDRESS_CODE = 'ERESERVEDADDRESSRANGE'
