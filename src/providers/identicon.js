const { get } = require('lodash')

module.exports = query => {
  const start = get(query, 'start', '64748B').replace(/[^a-zA-Z0-9]/, '')
  const end = get(query, 'end', '64748B').replace(/[^a-zA-Z0-9]/, '')
  const width = parseInt(get(query, 'width', 256))
  const height = parseInt(get(query, 'height', 256))
  const size = parseInt(get(query, 'size', 96))
  const text = get(query, 'text', '').replace(/[\W_]+/g, '')
  return `<svg viewBox="0 0 ${width} ${height}" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <g>
      <defs>
        <linearGradient id="avatar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#${start}"/>
          <stop offset="100%" stop-color="#${end}"/>
        </linearGradient>
      </defs>
      <rect fill="url(#avatar)" x="0" y="0" width="${width}" height="${height}"/>
      <text x="50%" y="51%" alignment-baseline="central" dominant-baseline="central" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="${size}">${text}</text>
    </g>
  </svg>`
}
