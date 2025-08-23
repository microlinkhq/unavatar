'use strict'

const { groupBy, sumBy, map, chunk, max, isEmpty } = require('lodash')
const debug = require('debug-logfmt')('unavatar:billing')
const { setTimeout } = require('timers/promises')

const EVENT_NAME = 'api_requests'

function create ({
  Stripe = require('stripe'),
  FLUSH_EVERY_MS = 5_000,
  MAX_CHUNK_SIZE = 5_000,
  MAX_RETRIES = 5
} = {}) {
  const timer = setInterval(sendOnce, FLUSH_EVERY_MS).unref()

  let queue = []
  let meterEventSession = null
  let sending = false

  async function refreshMeterEventSession () {
    if (
      meterEventSession === null ||
      new Date(meterEventSession.expires_at) <= new Date()
    ) {
      const client = new Stripe(process.env.STRIPE_SECRET_KEY)
      meterEventSession = await client.v2.billing.meterEventSession.create()
      debug('meterEventSession', meterEventSession)
    }
  }

  async function createMeterEventStream (events) {
    await refreshMeterEventSession()
    const client = new Stripe(meterEventSession.authentication_token)
    return client.v2.billing.meterEventStream.create({ events })
  }

  function add (customerId) {
    if (!customerId) {
      debug.error({ message: 'meter event missing stripe_customer_id' })
      return
    }

    queue.push({
      eventName: EVENT_NAME,
      timestamp: Date.now(),
      payload: {
        stripe_customer_id: customerId,
        value: '1'
      }
    })
  }

  // group by (eventName, customer) and generate unique identifiers
  function coalesce (events) {
    const grouped = groupBy(
      events,
      e => `${e.eventName}::${e.payload.stripe_customer_id}`
    )

    return map(grouped, items => {
      const [first] = items
      const total = sumBy(items, i => Number(i.payload.value || 0))
      const maxTimestamp = max(items.map(i => i.timestamp)) || first.timestamp

      return {
        event_name: first.eventName,
        payload: {
          ...first.payload,
          value: String(total),
          timestamp: String(maxTimestamp)
        }
      }
    })
  }

  async function withRetry (fn) {
    let delay = 250
    for (let attempt = 1; ; attempt++) {
      try {
        return await fn()
      } catch (err) {
        if (attempt >= MAX_RETRIES) throw err
        await setTimeout(delay)
        delay = Math.min(delay * 2, 5000)
      }
    }
  }

  async function sendOnce () {
    if (sending || isEmpty(queue)) return
    sending = true

    const batch = queue
    queue = []

    try {
      const condensed = coalesce(batch)

      for (const events of chunk(condensed, MAX_CHUNK_SIZE)) {
        await withRetry(async () => {
          try {
            debug('sending events', JSON.stringify(events, null, 2))
            await createMeterEventStream(events)
          } catch (error) {
            if (error?.statusCode === 401) {
              meterEventSession = null
            }
            throw error
          }
        })
      }
    } catch (err) {
      // re-queue so nothing is lost
      queue = batch.concat(queue)
      console.error('meterEventStream batch failed:', err)
    } finally {
      sending = false
    }
  }

  async function teardown () {
    try {
      // drain until empty or a final failure
      while (!isEmpty(queue)) {
        const before = queue.length
        await sendOnce()
        if (queue.length >= before) break // avoid infinite loop on persistent failure
      }
    } finally {
      clearInterval(timer)
    }
  }

  return { add, teardown, flush: sendOnce }
}

module.exports = create()
module.exports.create = create
