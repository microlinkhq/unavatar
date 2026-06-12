'use strict'

const API_URL = 'https://api.bilibili.com/x/web-interface/card'

const getAvatarUrl = input => `${API_URL}?mid=${encodeURIComponent(input)}`

// Users without a custom avatar get the generic `noface.jpg` placeholder.
const getAvatar = body => {
  if (body?.code !== 0) return
  const face = body.data?.card?.face
  return face && !face.endsWith('/noface.jpg') ? face : undefined
}

module.exports = ({ got }) =>
  async function bilibili (input) {
    const { body, statusCode } = await got(getAvatarUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400) return

    return getAvatar(body)
  }

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
