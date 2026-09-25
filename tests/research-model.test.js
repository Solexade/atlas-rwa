import test from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE, analyzeScenario, scenarioReport, readSavedScenarios, evidenceFor } from '../src/research-model.js';

test('independent shocks recalculate total and allocation', () => {
  const result = analyzeScenario(SAMPLE);
  assert.equal(result.before, 10000);
  assert.equal(result.after, 9350);
  assert.equal(result.delta, -650);
  assert.equal(result.percent, -6.5);
  assert.ok(Math.abs(result.assets.reduce((sum, a) => sum + a.afterWeight, 0) - 100) < 1e-10);
});
test('complete loss does not produce infinite concentration', () => {
  const result = analyzeScenario(SAMPLE.map(a => ({ ...a, shock: -100 })));
  assert.equal(result.after, 0);
  assert.equal(result.afterConcentration, null);
  assert.ok(result.assets.every(a => a.afterWeight === 0));
});
test('invalid and empty inputs cannot produce a report', () => {
  for (const rows of [[], [null], [{...SAMPLE[0], value:''}], [{...SAMPLE[0], value:null}], [{...SAMPLE[0], shock:101}], [{...SAMPLE[0], value:0}], [SAMPLE[0], SAMPLE[0]]]) assert.throws(() => analyzeScenario(rows));
});
test('exports preserve custom assumptions and mark hypothetical data', () => {
  const report = scenarioReport('Custom', [{id:'a', name:'Sample', value:200, shock:25}], '2026-09-25T00:00:00Z');
  assert.equal(report.result.after, 250);
  assert.equal(report.result.assets[0].shock, 25);
  assert.equal(report.mode, 'hypothetical');
  assert.equal(report.createdAt, '2026-09-25T00:00:00Z');
  assert.ok(report.assumptions.length >= 3);
});
test('saved scenarios survive reload and malformed storage is ignored', () => {
  const entry = {id:'a',name:'Saved',createdAt:'2026-09-25T00:00:00Z',rows:SAMPLE};
  assert.deepEqual(readSavedScenarios({getItem: () => JSON.stringify([entry, {id:'bad'}])}), [entry]);
  assert.deepEqual(readSavedScenarios({getItem: () => '{broken'}), []);
  assert.deepEqual(readSavedScenarios({getItem: () => {throw new Error('blocked');}}), []);
});
test('missing evidence never implies backing or geography verification', () => {
  const result = evidenceFor({price:null,lat:91,lng:0});
  assert.equal(result.priceAvailable, false);
  assert.equal(result.geographyAvailable, false);
  assert.equal(result.backing, 'Not verified by ATLAS');
});
