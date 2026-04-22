'use strict'

const HASH_REGEX = /^[0-9a-f]{32}$|^[0-9a-f]{64}$/i

module.exports = input => HASH_REGEX.test(input)
