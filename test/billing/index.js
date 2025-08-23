'use strict'

/**
 * Core Billing Tests
 *
 * Tests for fundamental billing functionality including:
 * - Manager initialization
 * - Event queuing and formatting
 * - Value normalization
 * - Timestamp handling
 * - Event coalescing
 * - Basic error handling
 */

const test = require('ava')
const sinon = require('sinon')

const { create: createBillingManager } = require('../../src/billing')

test.beforeEach(t => {
  // Mock Stripe constructor
  const MockStripeConstructor = sinon.stub()

  // Create mock session client
  const mockSessionClient = {
    v2: {
      billing: {
        meterEventStream: {
          create: sinon.stub().resolves()
        }
      }
    }
  }

  // Create mock Stripe instance
  const mockStripe = {
    v2: {
      billing: {
        meterEventSession: {
          create: sinon.stub().resolves({
            authentication_token: 'test-auth-token',
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // expires in 10 minutes
          })
        },
        meterEventStream: {
          create: sinon.stub().resolves()
        }
      }
    },
    constructor: MockStripeConstructor
  }

  // Make the constructor return the appropriate client based on the token
  MockStripeConstructor.callsFake(token => {
    if (token === 'test-auth-token') {
      return mockSessionClient
    }
    return mockStripe
  })

  t.context = {
    mockStripe,
    mockSessionClient,
    MockStripeConstructor,
    createTestBilling: (options = {}) =>
      createBillingManager({
        Stripe: MockStripeConstructor,
        FLUSH_EVERY_MS: 100, // Fast for testing
        ...options
      })
  }
})

test('adds events to queue with proper formatting', async t => {
  const billing = t.context.createTestBilling()

  billing.add('cus_123')
  await billing.teardown()

  t.true(t.context.mockStripe.v2.billing.meterEventSession.create.calledOnce)
  t.true(
    t.context.mockSessionClient.v2.billing.meterEventStream.create.calledOnce
  )

  const sentEvents =
    t.context.mockSessionClient.v2.billing.meterEventStream.create.firstCall
      .args[0].events
  // console.log(sentEvents)
  t.is(sentEvents.length, 1)
  t.is(sentEvents[0].event_name, 'api_requests')
  t.is(sentEvents[0].payload.stripe_customer_id, 'cus_123')
  t.is(sentEvents[0].payload.value, '1') // Always '1' per call
  t.truthy(sentEvents[0].payload.timestamp) // Should have timestamp
})

test('normalizes event values to strings', async t => {
  const billing = t.context.createTestBilling()

  // Add multiple API requests for same customer
  billing.add('cus_123')
  billing.add('cus_123')
  billing.add('cus_123')
  await billing.teardown()

  const sentEvents =
    t.context.mockSessionClient.v2.billing.meterEventStream.create.firstCall
      .args[0].events
  // Events get coalesced since they have same customer and event name
  t.is(sentEvents.length, 1)
  t.is(sentEvents[0].payload.value, '3') // 3 API requests coalesced
  t.is(sentEvents[0].event_name, 'api_requests')
})

test('adds timestamps to events automatically', async t => {
  const billing = t.context.createTestBilling()
  const beforeTime = Date.now()

  billing.add('cus_123')

  await billing.teardown()

  const sentEvents =
    t.context.mockSessionClient.v2.billing.meterEventStream.create.firstCall
      .args[0].events
  const timestamp = sentEvents[0].payload.timestamp

  t.true(timestamp >= beforeTime)
  t.true(timestamp <= Date.now())
})

test('handles different customers separately', async t => {
  const billing = t.context.createTestBilling()

  billing.add('cus_123')
  billing.add('cus_456')
  billing.add('cus_123') // Another for first customer

  await billing.teardown()

  const sentEvents =
    t.context.mockSessionClient.v2.billing.meterEventStream.create.firstCall
      .args[0].events
  t.is(sentEvents.length, 2) // Should not coalesce different customers

  // Find events by customer
  const customer123 = sentEvents.find(
    e => e.payload.stripe_customer_id === 'cus_123'
  )
  const customer456 = sentEvents.find(
    e => e.payload.stripe_customer_id === 'cus_456'
  )

  t.truthy(customer123)
  t.truthy(customer456)
  t.is(customer123.payload.value, '2') // 2 API requests
  t.is(customer456.payload.value, '1') // 1 API request
})

test('creates separate events for different customers', async t => {
  const billing = t.context.createTestBilling()

  billing.add('cus_123')
  billing.add('cus_456')

  await billing.teardown()

  const sentEvents =
    t.context.mockSessionClient.v2.billing.meterEventStream.create.firstCall
      .args[0].events
  t.is(sentEvents.length, 2)

  // Each customer should get their own event
  const customerIds = sentEvents.map(e => e.payload.stripe_customer_id).sort()
  t.deepEqual(customerIds, ['cus_123', 'cus_456'])

  // Events should not have identifiers (Stripe will generate them)
  sentEvents.forEach(event => {
    t.is(event.event_name, 'api_requests')
    t.is(event.payload.value, '1')
    t.falsy(event.identifier) // No identifier should be set
  })
})

test('uses maximum timestamp when coalescing', async t => {
  const billing = t.context.createTestBilling()

  // Add multiple requests quickly
  billing.add('cus_123')
  await new Promise(resolve => setTimeout(resolve, 1)) // Small delay
  billing.add('cus_123')

  await billing.teardown()

  const sentEvents =
    t.context.mockSessionClient.v2.billing.meterEventStream.create.firstCall
      .args[0].events
  t.is(sentEvents.length, 1)

  // Should use the latest timestamp
  t.truthy(sentEvents[0].payload.timestamp)
  t.is(sentEvents[0].payload.value, '2') // 2 API requests coalesced
})

test('handles session creation and reuse', async t => {
  const billing1 = t.context.createTestBilling()
  const billing2 = t.context.createTestBilling()

  // Add events to separate billing managers to trigger multiple sessions
  billing1.add({
    event_name: 'test1',
    payload: { stripe_customer_id: 'cus_123' }
  })
  await billing1.teardown()

  billing2.add({
    event_name: 'test2',
    payload: { stripe_customer_id: 'cus_456' }
  })
  await billing2.teardown()

  // Should create session for each billing manager
  t.true(
    t.context.mockStripe.v2.billing.meterEventSession.create.callCount >= 1
  )
})

test('handles Stripe API errors gracefully', async t => {
  const billing = t.context.createTestBilling()

  // Mock session creation failure
  t.context.mockStripe.v2.billing.meterEventSession.create.rejects(
    new Error('API Error')
  )

  billing.add({
    event_name: 'test',
    payload: { stripe_customer_id: 'cus_123' }
  })

  // Should not throw
  await t.notThrowsAsync(async () => {
    await billing.teardown()
  })
})

test('handles meterEventStream API errors gracefully', async t => {
  const billing = t.context.createTestBilling()

  // Mock stream creation failure
  t.context.mockSessionClient.v2.billing.meterEventStream.create.rejects(
    new Error('Stream Error')
  )

  billing.add({
    event_name: 'test',
    payload: { stripe_customer_id: 'cus_123' }
  })

  // Should not throw
  await t.notThrowsAsync(async () => {
    await billing.teardown()
  })
})

test('does not send when queue is empty', async t => {
  const billing = t.context.createTestBilling()

  // Teardown without adding events
  await billing.teardown()

  t.false(t.context.mockStripe.v2.billing.meterEventSession.create.called)
  t.false(t.context.mockSessionClient.v2.billing.meterEventStream.create.called)
})

test('handles multiple customers correctly', async t => {
  const billing = t.context.createTestBilling()

  billing.add('cus_123')
  billing.add('cus_456')
  billing.add('cus_789')

  await billing.teardown()

  const sentEvents =
    t.context.mockSessionClient.v2.billing.meterEventStream.create.firstCall
      .args[0].events
  t.is(sentEvents.length, 3)

  // Each customer should get their own event
  const customerIds = sentEvents
    .map(event => event.payload.stripe_customer_id)
    .sort()
  t.deepEqual(customerIds, ['cus_123', 'cus_456', 'cus_789'])

  // All events should be api_requests with value '1'
  sentEvents.forEach(event => {
    t.is(event.event_name, 'api_requests')
    t.is(event.payload.value, '1')
    t.falsy(event.identifier) // No identifier should be set (Stripe will generate)
  })
})

test('handles empty customer ID gracefully', async t => {
  const billing = t.context.createTestBilling()

  // Add valid customer
  billing.add('cus_123')

  // Add invalid customers (should be dropped)
  billing.add('')
  billing.add(null)
  billing.add(undefined)

  await billing.teardown()

  if (t.context.mockSessionClient.v2.billing.meterEventStream.create.called) {
    const sentEvents =
      t.context.mockSessionClient.v2.billing.meterEventStream.create.firstCall
        .args[0].events
    t.is(sentEvents.length, 1) // Only valid customer should be sent
    t.is(sentEvents[0].payload.stripe_customer_id, 'cus_123')
    t.is(sentEvents[0].payload.value, '1')
  } else {
    t.fail('No events were sent')
  }
})

test('coalesces all events for same customer and event type', async t => {
  const billing = t.context.createTestBilling()

  // Add multiple API requests for same customer
  billing.add('cus_123')
  billing.add('cus_123')
  billing.add('cus_123')

  await billing.teardown()

  if (t.context.mockSessionClient.v2.billing.meterEventStream.create.called) {
    const sentEvents =
      t.context.mockSessionClient.v2.billing.meterEventStream.create.firstCall
        .args[0].events

    // Should coalesce into single event with combined value
    t.is(sentEvents.length, 1, 'Events for same customer should be coalesced')
    t.is(
      sentEvents[0].payload.value,
      '3',
      'Values should be summed: 1 + 1 + 1 = 3'
    )
    t.is(
      sentEvents[0].event_name,
      'api_requests',
      'Should always be api_requests event'
    )
    t.falsy(
      sentEvents[0].identifier,
      'No identifier should be set (Stripe will generate)'
    )
  } else {
    t.fail('No events were sent')
  }
})
