'use strict'

const parseInput = input => {
  const [first, second] = input.split(':')
  return {
    type: second ? first : 'phone',
    id: second ?? first
  }
}

const getAvatarUrl = input => {
  const { type, id } = parseInput(input)
  switch (type) {
    case 'phone':
      return `https://api.whatsapp.com/send/?phone=${id}`
    case 'channel':
      return `https://www.whatsapp.com/channel/${id}`
    case 'chat':
    case 'group':
      return `https://chat.whatsapp.com/${id}`
    default:
      throw new Error(`Unsupported WhatsApp type: ${type}`)
  }
}

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'whatsapp',
    url: getAvatarUrl,
    getter: getOgImage
  })

module.exports.getAvatarUrl = getAvatarUrl
