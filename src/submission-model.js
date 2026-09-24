import { calculateAtlasScore } from './score.js';

// Fictional teaching fixtures: no deployed contracts, issuers or real locations.
export const DEMO_HOLDINGS = [
  { symbol: 'D-BOND', name: 'Demo Treasury Basket', sector: 'Simulated bonds', balance: 50, price: 100, holders: 0, live: false, color: '#6ee7b7' },
  { symbol: 'D-HOME', name: 'Demo Property Basket', sector: 'Simulated property', balance: 30, price: 100, holders: 0, live: false, color: '#93c5fd' },
  { symbol: 'D-GOLD', name: 'Demo Commodity Basket', sector: 'Simulated commodities', balance: 20, price: 100, holders: 0, live: false, color: '#fcd34d' },
];

export function simulatePortfolio(holdings, symbol, shockPercent) {
  const shock = Number(shockPercent);
  if (!Number.isFinite(shock) || shock < -100 || shock > 100) throw new Error('Price change must be between -100% and 100%.');
  const valued = holdings.filter(a => Number.isFinite(a.balance) && a.balance > 0 && Number.isFinite(a.price) && a.price > 0);
  const before = valued.reduce((sum, a) => sum + a.balance * a.price, 0);
  const changed = valued.map(a => ({ ...a, price: a.price * (symbol === 'all' || a.symbol === symbol ? 1 + shock / 100 : 1) }));
  const after = changed.reduce((sum, a) => sum + a.balance * a.price, 0);
  return {
    before, after, delta: after - before,
    changePercent: before ? (after - before) / before * 100 : 0,
    holdings: changed.map(a => ({ ...a, weight: after ? a.balance * a.price / after * 100 : 0 })),
    score: calculateAtlasScore(changed),
  };
}

export function checkConcentration(holdings, threshold) {
  const limit = Number(threshold);
  if (!Number.isFinite(limit) || limit < 1 || limit > 100) throw new Error('Threshold must be between 1% and 100%.');
  const valued = holdings.filter(a => Number.isFinite(a.balance) && a.balance > 0 && Number.isFinite(a.price) && a.price > 0);
  const total = valued.reduce((sum, a) => sum + a.balance * a.price, 0);
  if (!total) return null;
  const largest = valued.reduce((a, b) => a.balance * a.price >= b.balance * b.price ? a : b);
  const weight = largest.balance * largest.price / total * 100;
  return { symbol: largest.symbol, weight, triggered: weight >= limit };
}
