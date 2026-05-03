'use strict'

const HUGGINGFACE_API_URL = 'https://huggingface.co/api'

const getUserOverviewUrl = input =>
  `${HUGGINGFACE_API_URL}/users/${encodeURIComponent(input)}/overview`

const getOrganizationOverviewUrl = input =>
  `${HUGGINGFACE_API_URL}/organizations/${encodeURIComponent(input)}/overview`

const fetchAvatarUrl = async ({ got, url }) => {
  const { statusCode, body } = await got(url, {
    responseType: 'json',
    throwHttpErrors: false
  })

  if (statusCode >= 400) return
  return typeof body?.avatarUrl === 'string' ? body.avatarUrl : undefined
}

module.exports = ({ got }) =>
  async function huggingface (input) {
    const userAvatarUrl = await fetchAvatarUrl({
      got,
      url: getUserOverviewUrl(input)
    })
    if (userAvatarUrl) return userAvatarUrl

    return fetchAvatarUrl({
      got,
      url: getOrganizationOverviewUrl(input)
    })
  }

module.exports.getOrganizationOverviewUrl = getOrganizationOverviewUrl
module.exports.getUserOverviewUrl = getUserOverviewUrl
