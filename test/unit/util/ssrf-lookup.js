'use strict'

const { default: test } = require('ava')

const { createSsrfLookup } = require('../../../src/util/ssrf-lookup')

const answering =
  (...answer) =>
    (hostname, options, callback) =>
      callback(null, ...answer)

const lookupWith = (lookup, options) =>
  new Promise(resolve => {
    lookup('rebind.test', options, (error, address, family) =>
      resolve({ error, address, family })
    )
  })

const BOTH_FAMILIES = [
  { address: '1.1.1.1', family: 4 },
  { address: '2606:4700:4700::1111', family: 6 }
]

test('resolves once, always asking for every address', async t => {
  const calls = []
  const lookup = createSsrfLookup((hostname, options, callback) => {
    calls.push({ hostname, options })
    callback(null, [{ address: '1.1.1.1', family: 4 }])
  })

  t.deepEqual(await lookupWith(lookup, {}), {
    error: null,
    address: '1.1.1.1',
    family: 4
  })
  t.deepEqual(calls, [{ hostname: 'rebind.test', options: { all: true } }])
})

test('the whole answer is refused when any address in it is reserved', async t => {
  const lookup = createSsrfLookup(
    answering([
      { address: '1.1.1.1', family: 4 },
      { address: '10.0.0.1', family: 4 }
    ])
  )

  const { error, address } = await lookupWith(lookup, { all: true })

  t.is(error.code, 'ERESERVEDADDRESSRANGE')
  t.is(error.message, 'Refusing to request a reserved address: rebind.test')
  t.is(address, undefined)
})

test('every reserved range is refused', async t => {
  for (const reserved of [
    '127.0.0.1',
    '10.0.0.1',
    '172.16.0.1',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '::1',
    '::ffff:127.0.0.1',
    'fd00::1',
    'fe80::1',
    'not-an-ip'
  ]) {
    const lookup = createSsrfLookup(answering([{ address: reserved }]))
    const { error } = await lookupWith(lookup, {})
    t.is(error?.code, 'ERESERVEDADDRESSRANGE', reserved)
  }
})

test('options may be a callback, a family number, or missing', async t => {
  const lookup = createSsrfLookup(answering(BOTH_FAMILIES))

  const viaCallback = await new Promise(resolve => {
    lookup('rebind.test', (error, address, family) =>
      resolve({ error, address, family })
    )
  })
  t.deepEqual(viaCallback, { error: null, address: '1.1.1.1', family: 4 })
  t.deepEqual(await lookupWith(lookup, 6), {
    error: null,
    address: '2606:4700:4700::1111',
    family: 6
  })
  t.deepEqual(await lookupWith(lookup, null), {
    error: null,
    address: '1.1.1.1',
    family: 4
  })
})

test('all returns every checked address', async t => {
  const lookup = createSsrfLookup(answering(BOTH_FAMILIES))
  const { error, address } = await lookupWith(lookup, { all: true, family: 0 })
  t.is(error, null)
  t.deepEqual(address, BOTH_FAMILIES)
})

test('a family filter never hides a reserved address of the other family', async t => {
  const lookup = createSsrfLookup(
    answering([
      { address: '1.1.1.1', family: 4 },
      { address: 'fe80::1', family: 6 }
    ])
  )
  const { error } = await lookupWith(lookup, 4)
  t.is(error.code, 'ERESERVEDADDRESSRANGE')
})

test('a family with no address is not found', async t => {
  const lookup = createSsrfLookup(
    answering([{ address: '2606:4700:4700::1111', family: 6 }])
  )
  const { error } = await lookupWith(lookup, 4)
  t.is(error.code, 'ENOTFOUND')
  t.is(error.hostname, 'rebind.test')
})

test('an empty answer is not found', async t => {
  const lookup = createSsrfLookup(answering([]))
  const { error } = await lookupWith(lookup, {})
  t.is(error.code, 'ENOTFOUND')
})

test('string answers and entries without a family are checked and typed', async t => {
  t.is(
    (await lookupWith(createSsrfLookup(answering('10.0.0.1')), {})).error.code,
    'ERESERVEDADDRESSRANGE'
  )
  t.deepEqual(
    (await lookupWith(createSsrfLookup(answering(['1.1.1.1'])), { all: true }))
      .address,
    [{ address: '1.1.1.1', family: 4 }]
  )
  t.deepEqual(
    await lookupWith(
      createSsrfLookup(answering({ address: '2606:4700:4700::1111' }, 0)),
      {}
    ),
    { error: null, address: '2606:4700:4700::1111', family: 6 }
  )
})

test('an empty or non-string entry does not hide the rest of the answer', async t => {
  const lookup = createSsrfLookup(
    answering([
      { address: '' },
      { address: 1 },
      { address: '1.1.1.1', family: 4 }
    ])
  )
  const { address } = await lookupWith(lookup, { all: true })
  t.deepEqual(address, [{ address: '1.1.1.1', family: 4 }])
})

test('a resolver error is passed through untouched', async t => {
  const failure = Object.assign(new Error('nope'), { code: 'EAI_AGAIN' })
  const lookup = createSsrfLookup((hostname, options, callback) =>
    callback(failure)
  )
  t.is((await lookupWith(lookup, {})).error, failure)
})

test('a resolver that throws is reported through the callback', async t => {
  const boom = new Error('sync')
  const lookup = createSsrfLookup(() => {
    throw boom
  })
  t.is((await lookupWith(lookup, {})).error, boom)
})

test('only the first answer of a resolver that calls back twice is used', async t => {
  const first = Object.assign(new Error('first'), { code: 'EAI_AGAIN' })
  const sync = createSsrfLookup((hostname, options, callback) => {
    callback(first)
    callback(null, [{ address: '1.1.1.1', family: 4 }])
  })
  t.is((await lookupWith(sync, {})).error, first)

  const seen = []
  const async = createSsrfLookup((hostname, options, callback) => {
    process.nextTick(() => {
      callback(first)
      callback(null, [{ address: '1.1.1.1', family: 4 }])
    })
  })
  await new Promise(resolve => {
    async('rebind.test', {}, error => {
      seen.push(error)
      setTimeout(resolve, 20)
    })
  })
  t.deepEqual(seen, [first])
})

test('an asynchronous answer is checked the same way', async t => {
  const lookup = createSsrfLookup((hostname, options, callback) => {
    process.nextTick(() => callback(null, [{ address: '10.0.0.1', family: 4 }]))
  })
  t.is((await lookupWith(lookup, {})).error.code, 'ERESERVEDADDRESSRANGE')
})

test('an error thrown by the socket callback is not swallowed by the lookup', t => {
  const socketError = new Error('socket')
  const lookup = createSsrfLookup(
    answering([{ address: '1.1.1.1', family: 4 }])
  )
  t.throws(
    () =>
      lookup('rebind.test', {}, () => {
        throw socketError
      }),
    { is: socketError }
  )
})
