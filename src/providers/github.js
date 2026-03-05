'use strict'

const { stringify } = require('querystring')

module.exports = ({ constants }) =>
  async function github ({ input }) {
    return `https://github.com/${input}.png?${stringify({
      size: constants.AVATAR_SIZE
    })}`
  }
