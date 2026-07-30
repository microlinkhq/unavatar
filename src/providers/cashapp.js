'use strict'

const { get } = require('lodash')

const getAvatarUrl = input => `https://cash.app/$${input.replace(/^\$/, '')}`

// Extracts the first balanced `{...}` object after `marker`, respecting string
// literals so a `}` inside a value (e.g. a display name) doesn't end it early.
const extractObject = (source, marker) => {
  const start = source.indexOf(marker)
  if (start === -1) return
  const open = source.indexOf('{', start)
  if (open === -1) return
  let depth = 0
  let inString = false
  let escaped = false
  for (let index = open; index < source.length; index++) {
    const char = source[index]
    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') inString = false
    } else if (char === '"') inString = true
    else if (char === '{') depth++
    else if (char === '}' && --depth === 0) return source.slice(open, index + 1)
  }
}

const getAvatar = ({ $, NOT_FOUND }) => {
  const script = $('script')
    .filter((_, el) => $(el).text().includes('var profile ='))
    .text()
  const json = extractObject(script, 'var profile =')
  if (!json) return NOT_FOUND
  return get(JSON.parse(json), ['avatar', 'image_url']) ?? NOT_FOUND
}

const factory = ({ createHtmlProvider, NOT_FOUND }) =>
  createHtmlProvider({
    name: 'cashapp',
    url: getAvatarUrl,
    getter: $ => getAvatar({ $, NOT_FOUND })
  })

factory.getAvatarUrl = getAvatarUrl
factory.getAvatar = getAvatar

module.exports = factory
