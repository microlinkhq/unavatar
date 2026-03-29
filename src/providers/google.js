'use strict'

module.exports = () =>
  function google (input) {
    return `https://www.google.com/s2/favicons?domain_url=${input}&sz=128`
  }
