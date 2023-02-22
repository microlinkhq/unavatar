module.exports = class extends Error {
  constructor (props) {
    super()
    Object.assign(this, props)
  }
}
