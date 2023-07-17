'use strict'

const createBrowser = require('browserless')
const puppeteer = require('puppeteer')

const path = require('path')

const { TMP_FOLDER } = require('../constant')

const getArgs = () => {
  const PUPPETEER_DIR = path.join(TMP_FOLDER, `puppeteer-${Date.now()}`)
  const DATA_DIR = path.join(PUPPETEER_DIR, 'profile')
  const CACHE_DIR = path.join(PUPPETEER_DIR, 'cache')

  const args = createBrowser.driver.defaultArgs.concat([
    '--disk-cache-size=33554432', // https://source.chromium.org/search?q=lang:cpp+symbol:kDiskCacheSize&ss=chromium
    '--enable-features=SharedArrayBuffer', // https://source.chromium.org/search?q=file:content_features.cc&ss=chromium
    '--ignore-certificate-errors',
    '--allow-running-insecure-content', // https://source.chromium.org/search?q=lang:cpp+symbol:kAllowRunningInsecureContent&ss=chromium
    '--disable-gpu',
    '--enable-resource-load-scheduler=false',
    '--font-render-hinting=none', // could be 'none', 'medium'
    `--user-data-dir=${DATA_DIR}`,
    `--disk-cache-dir=${CACHE_DIR}`
  ])

  return { PUPPETEER_DIR, DATA_DIR, CACHE_DIR, args }
}

const browser = createBrowser({
  args: getArgs().args,
  puppeteer
})

module.exports = () => browser
