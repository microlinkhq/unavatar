'use strict'

const createBrowser = require('browserless')
const { randomUUID } = require('crypto')
const puppeteer = require('puppeteer')
const path = require('path')

module.exports = ({ TMP_FOLDER, isTest }) => {
  const PUPPETEER_BASE_DIR = path.join(TMP_FOLDER, 'puppeteer')

  const getPuppeteerDir = isTest
    ? () => path.join(`${PUPPETEER_BASE_DIR}-${randomUUID()}`)
    : () => PUPPETEER_BASE_DIR

  const getArgs = () => {
    const PUPPETEER_DIR = getPuppeteerDir()
    const DATA_DIR = path.join(PUPPETEER_DIR, 'profile')
    const CACHE_DIR = path.join(PUPPETEER_DIR, 'cache')

    const args = createBrowser.driver.defaultArgs.concat([
      '--allow-running-insecure-content',
      `--disk-cache-dir=${CACHE_DIR}`,
      `--user-data-dir=${DATA_DIR}`
    ])

    return { PUPPETEER_DIR, DATA_DIR, CACHE_DIR, args }
  }

  let browser

  return () => {
    if (!browser) {
      browser = createBrowser({
        args: getArgs().args,
        dumpio: false,
        pipe: true,
        puppeteer,
        waitForInitialPage: false
      })
    }
    return browser
  }
}
