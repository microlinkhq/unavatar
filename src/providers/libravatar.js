'use strict'

const crypto = require('crypto')

const stringify = require('../util/stringify')
const isHash = require('../util/is-hash')

const CENTRAL_SERVER = 'seccdn.libravatar.org'
const FEDERATION_SRV_PREFIX = '_avatars-sec._tcp.'
const HTTPS_PORT = 443
const MAX_PORT = 65535
const MAX_SIZE = 512
const HOSTNAME_REGEX =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i

const sha256 = str => crypto.createHash('sha256').update(str).digest('hex')

const parseInput = input => {
  if (isHash(input)) return { hash: input.toLowerCase() }
  const email = input.trim().toLowerCase()
  return {
    hash: sha256(email),
    domain: email.slice(email.lastIndexOf('@') + 1)
  }
}

const toServer = ({ name = '', port }) => {
  const hostname = name.replace(/\.$/, '')
  if (!HOSTNAME_REGEX.test(hostname)) return undefined
  if (port === HTTPS_PORT) return hostname
  if (Number.isInteger(port) && port > 0 && port <= MAX_PORT) {
    return `${hostname}:${port}`
  }
  return undefined
}

const byPreference = (a, b) => a.priority - b.priority || b.weight - a.weight

const getServer = records =>
  records.toSorted(byPreference).map(toServer).find(Boolean)

module.exports = ({ dnsResolver }) => {
  const resolveServer = domain =>
    dnsResolver
      .resolveSrv(`${FEDERATION_SRV_PREFIX}${domain}`)
      .then(records => getServer(records) ?? CENTRAL_SERVER)
      .catch(() => CENTRAL_SERVER)

  return async function libravatar (input) {
    const { hash, domain } = parseInput(input)
    const server = domain ? await resolveServer(domain) : CENTRAL_SERVER
    return `https://${server}/avatar/${hash}?${stringify({
      s: MAX_SIZE,
      d: '404',
      gravatarproxy: 'n'
    })}`
  }
}

module.exports.parseInput = parseInput
