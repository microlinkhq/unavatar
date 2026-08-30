'use strict'

module.exports = ({ got }) =>
  async function kick (input) {
    const { body } = await got(
      `https://kick.com/api/v2/channels/${encodeURIComponent(input)}`,
      { responseType: 'json' }
    )

    return body?.user?.profile_pic
  }
