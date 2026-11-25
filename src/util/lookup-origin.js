'use strict'

const { parseUrl } = require('@metascraper/helpers')
const got = require('got')

const { isReservedAddress, literalAddresses } = require('./is-reserved-ip')

const cache = new Map()

const addressesOf = async (hostname, cacheableLookup) => {
  const literals = literalAddresses(hostname)
  if (literals) return literals
  const result = await cacheableLookup.lookupAsync(hostname, { all: true })
  return result.map(entry => entry.address)
}

/**
 * ASN of the origin server, from its IP. Used when a fetch never gets a
 * status code: is-antibot can then tell an antibot edge from a dead host.
 *
 * @returns {Promise<{ asn?: string | number }|undefined>}
 */
module.exports = ({ cacheableLookup, token, timeout } = {}) => {
  if (!token) return async () => undefined

  const radar = got.extend({
    prefixUrl: 'https://api.cloudflare.com/client/v4/radar/',
    responseType: 'json',
    resolveBodyOnly: true,
    timeout: { request: timeout },
    retry: { limit: 0 },
    headers: {
      authorization: `Bearer ${token}`,
      'user-agent': undefined
    }
  })

  const lookupIp = ip =>
    radar('entities/ip', { searchParams: { ip } }).then(body => body.result?.ip)

  return async url => {
    const { hostname } = parseUrl(url)
    if (!hostname) return

    try {
      const address = (await addressesOf(hostname, cacheableLookup)).find(
        item => !isReservedAddress(item)
      )
      if (!address) return
      if (cache.has(address)) return cache.get(address)

      const result = await lookupIp(address)
      const origin = { asn: result?.asn }
      cache.set(address, origin)
      return origin
    } catch {}
  }
}

module.exports.cache = cache
