'use strict'

const PORTRAIT_URL = 'https://himg.bdimg.com/sys/portrait/item'

const getAvatarUrl = input =>
  `https://tieba.baidu.com/i/sys/user_json?un=${encodeURIComponent(
    input
  )}&ie=utf-8`

const getAvatar = body => {
  const portrait = body?.creator?.portrait
  return portrait ? `${PORTRAIT_URL}/${portrait}` : undefined
}

module.exports = ({ got }) =>
  async function tieba (input) {
    // Unknown users respond with an empty body, which is not valid JSON.
    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'text',
      throwHttpErrors: false
    })

    if (statusCode >= 400 || !body) return

    let json
    try {
      json = JSON.parse(body)
    } catch {
      return undefined
    }

    return getAvatar(json)
  }

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
