'use strict'

const parseInput = input => {
  if (input.startsWith('https://') || input.startsWith('http://')) {
    return { kind: 'url', value: input }
  }

  if (input.startsWith('/store/apps/')) {
    return { kind: 'url', value: `https://play.google.com${input}` }
  }

  const [type, ...rest] = input.split(':')
  if (rest.length > 0) {
    return { kind: type, value: rest.join(':') }
  }

  return { kind: 'app', value: input }
}

const getAvatarUrl = input => {
  const { kind, value } = parseInput(input)

  if (kind === 'url') return value

  if (kind === 'dev') {
    return `https://play.google.com/store/apps/dev?id=${encodeURIComponent(value)}`
  }

  if (kind === 'app') {
    return `https://play.google.com/store/apps/details?id=${encodeURIComponent(value)}`
  }

  return `https://play.google.com/store/apps/details?id=${encodeURIComponent(input)}`
}

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'google-play',
    url: getAvatarUrl,
    getter: getOgImage
  })

module.exports.getAvatarUrl = getAvatarUrl
module.exports.parseInput = parseInput
