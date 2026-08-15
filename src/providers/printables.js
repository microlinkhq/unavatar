'use strict'

const API_URL = 'https://api.printables.com/graphql/'
const MEDIA_URL = 'https://media.printables.com'

const SEARCH_QUERY = `query SearchUsers($query: String!) {
  result: searchUsers2(query: $query, limit: 10) {
    items { handle avatarFilePath }
  }
}`

const normalizeHandle = input =>
  String(input || '')
    .trim()
    .replace(/^@/, '')
    .trim()

const getAvatar = (body, handle) => {
  const items = body?.data?.result?.items
  if (!Array.isArray(items) || !handle) return

  const user = items.find(
    item => String(item?.handle || '').toLowerCase() === handle.toLowerCase()
  )
  const path = user?.avatarFilePath
  if (!path) return

  return `${MEDIA_URL}/${path.replace(/^\//, '')}`
}

module.exports = ({ got }) =>
  async function printables (input) {
    const handle = normalizeHandle(input)
    if (!handle) return

    const { body, statusCode } = await got(API_URL, {
      method: 'POST',
      responseType: 'json',
      throwHttpErrors: false,
      json: { query: SEARCH_QUERY, variables: { query: handle } },
      headers: { origin: 'https://www.printables.com' }
    })

    if (statusCode >= 400) return

    return getAvatar(body, handle)
  }

module.exports.getAvatar = getAvatar
module.exports.normalizeHandle = normalizeHandle
