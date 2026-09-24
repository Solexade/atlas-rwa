import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_HOLDINGS, simulatePortfolio, checkConcentration } from '../src/submission-model.js';

test('20% property shock loses $600 without changing the fixtures', () => {
  const result = simulatePortfolio(DEMO_HOLDINGS, 'D-HOME', -20);
  assert.equal(result.before, 10000);
  assert.equal(result.after, 9400);
  assert.equal(result.delta, -600);
  assert.equal(result.changePercent, -6);
  assert.equal(DEMO_HOLDINGS[1].price, 100);
  assert.ok(Math.abs(result.holdings.reduce((sum, a) => sum + a.weight, 0) - 100) < 0.00001);
});
test('complete loss has zero weights and no score', () => {
  const result = simulatePortfolio(DEMO_HOLDINGS, 'all', -100);
  assert.equal(result.after, 0);
  assert.equal(result.score, null);
  assert.ok(result.holdings.every(a => a.weight === 0));
});
test('positive and unchanged scenarios', () => {
  assert.equal(simulatePortfolio(DEMO_HOLDINGS, 'all', 20).after, 12000);
  assert.equal(simulatePortfolio(DEMO_HOLDINGS, 'all', 0).delta, 0);
});
test('concentration threshold is inclusive and ignores unpriced balances', () => {
  assert.deepEqual(checkConcentration(DEMO_HOLDINGS, 50), { symbol: 'D-BOND', weight: 50, triggered: true });
  assert.equal(checkConcentration(DEMO_HOLDINGS, 51).triggered, false);
  assert.equal(checkConcentration([{ balance: 100, price: 0 }], 50), null);
});
test('reject invalid scenario and rule inputs', () => {
  for (const value of [NaN, Infinity, -101, 101]) assert.throws(() => simulatePortfolio(DEMO_HOLDINGS, 'all', value));
  for (const value of [NaN, Infinity, 0, 101]) assert.throws(() => checkConcentration(DEMO_HOLDINGS, value));
});
