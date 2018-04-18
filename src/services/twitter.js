'use strict'

module.exports = async username => {
  return `https://twitter.com/${username}/profile_image?size=original`
}

module.exports.supported = {
  email: false,
  username: true
}
