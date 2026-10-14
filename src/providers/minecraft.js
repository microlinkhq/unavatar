'use strict'

const MOJANG_PROFILE_API_URL =
  'https://api.minecraftservices.com/minecraft/profile/lookup'
const MC_HEADS_AVATAR_URL = 'https://mc-heads.net/avatar'

const UUID_RE =
  /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i

const parseInput = input =>
  UUID_RE.test(input)
    ? { type: 'uuid', value: input.replace(/-/g, '').toLowerCase() }
    : { type: 'name', value: input }

const getAvatarUrl = input => {
  const { type, value } = parseInput(input)
  const path = type === 'uuid' ? value : `name/${encodeURIComponent(value)}`
  return `${MOJANG_PROFILE_API_URL}/${path}`
}

const getAvatar = (body, size) =>
  typeof body?.id === 'string' && body.id
    ? `${MC_HEADS_AVATAR_URL}/${body.id}/${size}`
    : undefined

module.exports = ({ constants, got }) =>
  async function minecraft (input) {
    const { statusCode, body } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body, constants.AVATAR_SIZE)
  }

module.exports.parseInput = parseInput
module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
