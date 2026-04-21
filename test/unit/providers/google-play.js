'use strict'

const cheerio = require('cheerio')
const ava = require('ava')

const getOgImage = require('../../../src/util/get-og-image')
const { getAvatarUrl } = require('../../../src/providers/google-play')

ava('.getAvatarUrl defaults to app details page', t => {
  t.is(
    getAvatarUrl('com.devolver.grispaid'),
    'https://play.google.com/store/apps/details?id=com.devolver.grispaid'
  )
})

ava('.getAvatarUrl supports explicit app type', t => {
  t.is(
    getAvatarUrl('app:com.devolver.grispaid'),
    'https://play.google.com/store/apps/details?id=com.devolver.grispaid'
  )
})

ava('.getAvatarUrl supports explicit dev type', t => {
  t.is(
    getAvatarUrl('dev:6592603558263828430'),
    'https://play.google.com/store/apps/dev?id=6592603558263828430'
  )
})

ava('.getAvatarUrl keeps full details URL input', t => {
  t.is(
    getAvatarUrl('https://play.google.com/store/apps/details?id=com.devolver.grispaid'),
    'https://play.google.com/store/apps/details?id=com.devolver.grispaid'
  )
})

ava('.getAvatarUrl keeps full dev URL input', t => {
  t.is(
    getAvatarUrl('https://play.google.com/store/apps/dev?id=6592603558263828430'),
    'https://play.google.com/store/apps/dev?id=6592603558263828430'
  )
})

ava('getter extracts app og:image from google play app markup', t => {
  const appHtml =
    '<!doctype html><html><head>' +
    '<meta property="og:image" content="https://play-lh.googleusercontent.com/b_gnR-Z0jbqWgqsO2_mfBNtqY_8yJfWf9aXsFPvHUuF9s5UNvXWKfFqqk93IKOmR1AM">' +
    '</head><body></body></html>'
  const $ = cheerio.load(appHtml)

  t.is(
    getOgImage($),
    'https://play-lh.googleusercontent.com/b_gnR-Z0jbqWgqsO2_mfBNtqY_8yJfWf9aXsFPvHUuF9s5UNvXWKfFqqk93IKOmR1AM'
  )
})

ava('getter extracts dev og:image from google play dev markup', t => {
  const devHtml =
    '<!doctype html><html><head>' +
    '<meta property="og:image" content="https://play-lh.googleusercontent.com/cJ32ddaxCLKkci_dwFzdllDv1DNEhry4S9REXIwYIatlWhW9bzwfIC4H9T_6EIniGA">' +
    '</head><body></body></html>'
  const $ = cheerio.load(devHtml)

  t.is(
    getOgImage($),
    'https://play-lh.googleusercontent.com/cJ32ddaxCLKkci_dwFzdllDv1DNEhry4S9REXIwYIatlWhW9bzwfIC4H9T_6EIniGA'
  )
})
