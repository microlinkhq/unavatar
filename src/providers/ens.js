'use strict'

const ENS_AVATAR_URL = 'https://metadata.ens.domains/mainnet/avatar'
const ENS_TLD = '.eth'

const parseInput = input => {
  const name = input.trim().toLowerCase()
  return name.includes('.') ? name : `${name}${ENS_TLD}`
}

const getAvatarUrl = input =>
  `${ENS_AVATAR_URL}/${encodeURIComponent(parseInput(input))}`

module.exports = () =>
  function ens (input) {
    return getAvatarUrl(input)
  }

module.exports.parseInput = parseInput
module.exports.getAvatarUrl = getAvatarUrl
