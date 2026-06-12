'use strict'

const API_URL = 'https://api.juejin.cn/user_api/v1/user/get'

const getAvatarUrl = input => `${API_URL}?user_id=${encodeURIComponent(input)}`

// Unknown ids still respond `err_no: 0`, but with an empty profile.
const getAvatar = body => {
  if (body?.err_no !== 0) return
  return body.data?.avatar_large || undefined
}

module.exports = ({ got }) =>
  async function juejin (input) {
    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
