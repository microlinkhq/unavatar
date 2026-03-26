'use strict'

const linkedinUrl = input => {
  const [first, second] = input.split(':')
  const type = second ? first : 'user'
  const id = second ?? first
  const path = type === 'user' ? 'in' : type
  return `https://www.linkedin.com/${path}/${id}`
}

module.exports = ({ createHtmlProvider, getOgImage }) =>
  createHtmlProvider({
    name: 'linkedin',
    url: linkedinUrl,
    getter: getOgImage
  })
