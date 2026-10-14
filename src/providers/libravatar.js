'use strict'

const stringify = require('../util/stringify')
const isHash = require('../util/is-hash')
const { toHash } = require('./gravatar')

const CENTRAL_SERVER = 'seccdn.libravatar.org'
const FEDERATION_SRV_PREFIX = '_avatars-sec._tcp.'
const HTTPS_PORT = 443
const MAX_PORT = 65535
const HOSTNAME_REGEX =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i

const parseInput = input => {
  const hash = toHash(input)
  if (isHash(input)) return { hash }
  return { hash, domain: input.trim().toLowerCase().split('@').pop() }
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

module.exports = ({ constants, dnsResolver }) => {
  const resolveServer = domain =>
    dnsResolver
      .resolveSrv(`${FEDERATION_SRV_PREFIX}${domain}`)
      .then(records => getServer(records) ?? CENTRAL_SERVER)
      .catch(() => CENTRAL_SERVER)

  return async function libravatar (input) {
    const { hash, domain } = parseInput(input)
    const server = domain ? await resolveServer(domain) : CENTRAL_SERVER
    return `https://${server}/avatar/${hash}?${stringify({
      s: constants.AVATAR_SIZE,
      d: '404',
      gravatarproxy: 'n'
    })}`
  }
}

module.exports.parseInput = parseInput
