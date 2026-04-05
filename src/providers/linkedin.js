'use strict'

const LINKEDIN_BLOCKED_STATUS = 999

const getAvatarUrl = input => {
  const [first, second] = input.split(':')
  const type = second ? first : 'user'
  const id = second ?? first
  const path = type === 'user' ? 'in' : type
  return `https://www.linkedin.com/${path}/${id}`
}

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'linkedin',
    url: getAvatarUrl,
    getter: getOgImage,
    isBlocked: ({ statusCode }) => statusCode === LINKEDIN_BLOCKED_STATUS
  })

module.exports.getAvatarUrl = getAvatarUrl
