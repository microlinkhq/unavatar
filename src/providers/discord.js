'use strict'

const DISCORD_INVITE_HOST_RE =
  /^(?:www\.)?(?:discord\.gg|discord(?:app)?\.com)$/i
const DISCORD_GUILD_ID_RE =
  /^https:\/\/cdn\.discordapp\.com\/splashes\/(\d+)\/[^/?#]+\.[^/?#]+(?:\?[^#]+)?(?:#.*)?$/

const DISCORD_INVITE_URL_BASE = 'https://discord.com/invite/'

const getInviteCode = input => {
  if (typeof input !== 'string') return null

  const value = input.trim()
  if (value === '') return null

  const hasProtocol = value.includes('://')
  const hasPath = value.includes('/')

  if (!hasProtocol && !hasPath) return value

  const normalizedInput = hasProtocol ? value : `https://${value}`

  let url
  try {
    url = new URL(normalizedInput)
  } catch {
    return null
  }

  if (!DISCORD_INVITE_HOST_RE.test(url.hostname)) return null

  const [firstSegment, secondSegment] = url.pathname.split('/').filter(Boolean)
  if (!firstSegment) return null

  if (url.hostname.includes('discord.gg')) return firstSegment

  if (firstSegment === 'invite' || firstSegment === 'invites') {
    return secondSegment ?? null
  }

  return null
}

const buildInviteUrl = inviteCode => `${DISCORD_INVITE_URL_BASE}${inviteCode}`

const getInviteUrl = input => {
  const inviteCode = getInviteCode(input)
  return inviteCode ? buildInviteUrl(inviteCode) : undefined
}

const getInviteApiUrl = inviteCode =>
  `https://discord.com/api/v9/invites/${encodeURIComponent(
    inviteCode
  )}?with_counts=true&with_expiration=true`

const getGuildIdFromOgImage = ogImage =>
  ogImage?.match(DISCORD_GUILD_ID_RE)?.[1]

const getAvatarUrl = ({ ogImage, iconHash }) => {
  const guildId = getGuildIdFromOgImage(ogImage)
  if (!guildId || !iconHash) return undefined
  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.webp`
}

module.exports = ({ createHtmlProvider, getOgImage, got }) => {
  const fromInvite = createHtmlProvider({
    name: 'discord',
    url: buildInviteUrl,
    getter: getOgImage
  })

  return async function discord (input, context) {
    const inviteCode = getInviteCode(input)
    if (!inviteCode) return undefined

    const ogImage = await fromInvite(inviteCode, context)
    if (!ogImage) return undefined

    const metadataResponse = await got(getInviteApiUrl(inviteCode), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (metadataResponse.statusCode >= 400) return undefined

    const iconHash = metadataResponse.body?.guild?.icon

    return getAvatarUrl({ ogImage, iconHash })
  }
}

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getGuildIdFromOgImage = getGuildIdFromOgImage
module.exports.getInviteCode = getInviteCode
module.exports.getInviteUrl = getInviteUrl
