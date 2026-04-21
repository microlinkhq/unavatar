'use strict'

const GOOGLE_PLAY_URL = 'https://play.google.com'
const DETAILS_PAGE_URL = `${GOOGLE_PLAY_URL}/store/apps/details?id=`
const DEV_PAGE_URL = `${GOOGLE_PLAY_URL}/store/apps/dev?id=`

const parseInput = input => {
  if (input.startsWith('https://') || input.startsWith('http://')) {
    return { kind: 'url', value: input }
  }

  if (input.startsWith('/store/apps/')) {
    return { kind: 'url', value: `${GOOGLE_PLAY_URL}${input}` }
  }

  const separatorIndex = input.indexOf(':')
  if (separatorIndex !== -1) {
    return {
      kind: input.slice(0, separatorIndex),
      value: input.slice(separatorIndex + 1)
    }
  }

  return { kind: 'app', value: input }
}

const getAvatarUrl = input => {
  const { kind, value } = parseInput(input)

  if (kind === 'url') return value

  if (kind === 'dev') return `${DEV_PAGE_URL}${encodeURIComponent(value)}`

  if (kind !== 'app') return `${DETAILS_PAGE_URL}${encodeURIComponent(value)}`

  return `${DETAILS_PAGE_URL}${encodeURIComponent(value)}`
}

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'google-play',
    url: getAvatarUrl,
    getter: getOgImage
  })

module.exports.getAvatarUrl = getAvatarUrl
module.exports.parseInput = parseInput
