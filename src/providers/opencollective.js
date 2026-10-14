'use strict'

const PROFILE_URL = 'https://opencollective.com'
const IMAGES_URL = 'https://images.opencollective.com'

const getProfileUrl = input =>
  `${PROFILE_URL}/${encodeURIComponent(input)}.json`

const getAvatarUrl = ({ constants, slug }) =>
  `${IMAGES_URL}/${encodeURIComponent(slug)}/avatar/${
    constants.AVATAR_SIZE
  }.png`

module.exports = ({ constants, got }) =>
  async function opencollective (input) {
    const { body, statusCode } = await got(getProfileUrl(input), {
      responseType: 'json',
      throwHttpErrors: false
    })

    if (statusCode >= 400 || !body?.image || !body.slug) return

    return getAvatarUrl({ constants, slug: body.slug })
  }

module.exports.getProfileUrl = getProfileUrl
module.exports.getAvatarUrl = getAvatarUrl
