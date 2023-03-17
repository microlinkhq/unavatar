module.exports = fn =>
  (
    cache =>
      (...args) =>
        cache[args] || (cache[args] = fn(...args))
  )(Object.create(null))
