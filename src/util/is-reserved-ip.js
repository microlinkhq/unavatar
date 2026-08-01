'use strict'

const ip = require('ipaddr.js')

const unbracket = hostname =>
  hostname.startsWith('[') && hostname.endsWith(']')
    ? hostname.slice(1, -1)
    : hostname

module.exports = ({ cacheableLookup }) => {
  const getIpAddress = async hostname => {
    if (ip.IPv4.isIPv4(hostname)) return hostname
    const literal = unbracket(hostname)
    if (ip.IPv6.isIPv6(literal)) return literal
    const { address } = await cacheableLookup.lookupAsync(hostname)
    return address
  }

  return async hostname => {
    const ipAddress = await getIpAddress(hostname)
    return ip.process(ipAddress).range() !== 'unicast'
  }
}
