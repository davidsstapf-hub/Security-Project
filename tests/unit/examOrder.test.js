import test from 'node:test'
import assert from 'node:assert/strict'
import { isValidQuestionOrder, shuffleQuestionOrder } from '../../src/lib/examOrder.js'

test('exam shuffle creates a complete question permutation', () => {
  const values = [.91,.12,.74,.33,.58,.04,.87,.21]
  let index = 0
  const order = shuffleQuestionOrder(8,() => values[index++])
  assert.equal(order.length,8)
  assert.equal(new Set(order).size,8)
  assert.deepEqual([...order].sort((a,b) => a-b),[0,1,2,3,4,5,6,7])
  assert.notDeepEqual(order,[0,1,2,3,4,5,6,7])
})

test('different attempts can produce different orders and saved orders validate', () => {
  const first = shuffleQuestionOrder(6,() => .1)
  const second = shuffleQuestionOrder(6,() => .9)
  assert.notDeepEqual(first,second)
  assert.equal(isValidQuestionOrder(first,6),true)
  assert.equal(isValidQuestionOrder([0,1,1],3),false)
})
