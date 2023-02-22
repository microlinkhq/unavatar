const isIterable = input => typeof input[Symbol.iterator] === 'function'

isIterable.forEach = (input, fn) => {
  for (const item of isIterable(input) ? input : [].concat(input)) {
    fn(item)
  }
}

module.exports = isIterable
