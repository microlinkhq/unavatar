'use strict'

const createBrowser = require('browserless')
const puppeteer = require('puppeteer')

const path = require('path')

const { TMP_FOLDER } = require('../constant')

const args = createBrowser.driver.defaultArgs.concat([
  '--disk-cache-size=33554432', // https://source.chromium.org/search?q=lang:cpp+symbol:kDiskCacheSize&ss=chromium
  '--enable-features=SharedArrayBuffer', // https://source.chromium.org/search?q=file:content_features.cc&ss=chromium
  '--ignore-certificate-errors',
  '--allow-running-insecure-content', // https://source.chromium.org/search?q=lang:cpp+symbol:kAllowRunningInsecureContent&ss=chromium
  '--disable-gpu',
  '--disable-web-security',
  '--enable-resource-load-scheduler=false',
  '--font-render-hinting=none', // could be 'none', 'medium'
  `--user-data-dir=${path.join(TMP_FOLDER, 'puppeteer', 'data')}`,
  `--disk-cache-dir=${path.join(TMP_FOLDER, 'puppeteer', 'cache')}`
])

const browser = createBrowser({
  args,
  puppeteer
})

module.exports = () => browser
