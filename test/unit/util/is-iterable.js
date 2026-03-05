'use strict'

const test = require('ava')

const isIterable = require('../../../src/util/is-iterable')

test('detects iterable values', t => {
  t.true(isIterable([]))
  t.true(isIterable(new Set([1])))
  t.true(isIterable('text'))
})

test('detects non-iterable values', t => {
  t.false(isIterable({}))
  t.false(isIterable(123))
})

test('forEach iterates over iterables and non-iterables uniformly', t => {
  const iterableItems = []
  isIterable.forEach(new Set(['a', 'b']), item => iterableItems.push(item))
  t.deepEqual(iterableItems, ['a', 'b'])

  const nonIterableItems = []
  isIterable.forEach({ hello: 'world' }, item => nonIterableItems.push(item))
  t.deepEqual(nonIterableItems, [{ hello: 'world' }])
})
