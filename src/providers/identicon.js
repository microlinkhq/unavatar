'use strict'

const { get } = require('lodash')
const crypto = require('crypto')
const Color = require('color')

function djb2 (str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i)
  }
  return hash
}

function shouldChangeColor (color) {
  const rgb = color.rgb().array()
  const val = 765 - (rgb[0] + rgb[1] + rgb[2])
  if (val < 250 || val > 700) {
    return true
  }
  return false
}

function hashStringToColor (str) {
  const hash = djb2(str)
  const r = (hash & 0xff0000) >> 16
  const g = (hash & 0x00ff00) >> 8
  const b = hash & 0x0000ff
  return (
    '#' +
    ('0' + r.toString(16)).substr(-2) +
    ('0' + g.toString(16)).substr(-2) +
    ('0' + b.toString(16)).substr(-2)
  )
}

function getMatchingColor (firstColor) {
  let color = firstColor
  if (color.dark()) {
    color = color.saturate(0.3).rotate(90)
  } else {
    color = color.desaturate(0.3).rotate(90)
  }
  if (shouldChangeColor(color)) {
    color = color.rotate(-200).saturate(0.5)
  }
  return color
}

function generateGradient (text) {
  const hash = crypto
    .createHash('md5')
    .update(text)
    .digest('hex')

  let firstColor = hashStringToColor(hash)
  firstColor = new Color(firstColor).saturate(0.5)

  const lightning = firstColor.hsl().color[2]
  if (lightning < 25) {
    firstColor = firstColor.lighten(3)
  }
  if (lightning > 25 && lightning < 40) {
    firstColor = firstColor.lighten(0.8)
  }
  if (lightning > 75) {
    firstColor = firstColor.darken(0.4)
  }

  return {
    defaultStart: firstColor.hex(),
    defaultEnd: getMatchingColor(firstColor).hex()
  }
}

module.exports = query => {
  const text = get(query, 'text', '').replace(/[\W_]+/g, '')
  const { defaultStart, defaultEnd } = generateGradient(text)
  const start = get(query, 'start', defaultStart).replace(/[^a-zA-Z0-9]/, '')
  const end = get(query, 'end', defaultEnd).replace(/[^a-zA-Z0-9]/, '')
  const width = parseInt(get(query, 'width', 256))
  const height = parseInt(get(query, 'height', 256))
  const size = parseInt(get(query, 'size', 96))
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
