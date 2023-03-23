module.exports = class ExtendableError extends Error {
  constructor (props) {
    super()
    Object.assign(this, props)
  }
}
