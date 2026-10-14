'use strict'

const { ens_normalize: normalizeEnsName } = require('@adraffy/ens-normalize')

const ENS_AVATAR_URL = 'https://metadata.ens.domains/mainnet/avatar'
const ENS_TLD = '.eth'

const parseInput = input => {
  const name = input.trim()
  try {
    return normalizeEnsName(name.includes('.') ? name : `${name}${ENS_TLD}`)
  } catch {}
}

const getAvatarUrl = input => {
  const name = parseInput(input)
  return name && `${ENS_AVATAR_URL}/${encodeURIComponent(name)}`
}

module.exports = () =>
  function ens (input) {
    return getAvatarUrl(input)
  }

module.exports.parseInput = parseInput
module.exports.getAvatarUrl = getAvatarUrl
