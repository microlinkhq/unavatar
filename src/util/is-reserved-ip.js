'use strict'

const ip = require('ipaddr.js')

module.exports = ({ cacheableLookup }) => {
  const getIpAddress = async hostname => {
    if (ip.IPv4.isIPv4(hostname)) return hostname
    if (
      hostname.startsWith('[') &&
      hostname.endsWith(']') &&
      ip.IPv6.isIPv6(hostname.slice(1, -1))
    ) {
      return hostname.slice(1, -1)
    }
    const { address } = await cacheableLookup.lookupAsync(hostname)
    return address
  }

  return async hostname => {
    const ipAddress = await getIpAddress(hostname)
    return ip.process(ipAddress).range() !== 'unicast'
  }
}
