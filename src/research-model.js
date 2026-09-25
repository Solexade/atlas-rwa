export const SAMPLE = [
  { id: 'bond', name: 'Fictional bond basket', value: 5000, shock: -5 },
  { id: 'property', name: 'Fictional property basket', value: 3000, shock: -20 },
  { id: 'commodity', name: 'Fictional commodity basket', value: 2000, shock: 10 },
];

export function analyzeScenario(rows) {
  if (!Array.isArray(rows) || !rows.length || rows.length > 12) throw new Error('Use between 1 and 12 assets.');
  const ids = new Set();
  const assets = rows.map(row => {
    if (!row || !row.id || ids.has(row.id)) throw new Error('Asset IDs must be unique.');
    ids.add(row.id);
    const value = Number(row.value), shock = Number(row.shock);
    if (typeof row.name !== 'string' || !row.name.trim() || row.name.length > 80) throw new Error('Each asset needs a name of up to 80 characters.');
    if (row.value == null || typeof row.value === 'boolean' || String(row.value).trim() === '' || !Number.isFinite(value) || value < 0 || value > 1e12) throw new Error('Enter asset values from 0 to 1 trillion.');
    if (row.shock == null || typeof row.shock === 'boolean' || String(row.shock).trim() === '' || !Number.isFinite(shock) || shock < -100 || shock > 100) throw new Error('Enter price changes from -100% to 100%.');
    return { id: row.id, name: row.name.trim(), value, shock, after: value * (1 + shock / 100) };
  });
  const before = assets.reduce((s, a) => s + a.value, 0);
  if (!before) throw new Error('Add a positive asset value to run the scenario.');
  const after = assets.reduce((s, a) => s + a.after, 0);
  return { before, after, delta: after - before, percent: (after - before) / before * 100,
    concentration: Math.max(...assets.map(a => a.value / before * 100)),
    afterConcentration: after ? Math.max(...assets.map(a => a.after / after * 100)) : null,
    assets: assets.map(a => ({ ...a, weight: a.value / before * 100, afterWeight: after ? a.after / after * 100 : 0 })) };
}

export function evidenceFor(asset) {
  return {
    contract: asset.contractAddress || 'Not supplied',
    source: asset.source || 'Source not supplied',
    priceAvailable: Number.isFinite(Number(asset.price)) && Number(asset.price) > 0,
    geographyAvailable: Number.isFinite(asset.lat) && Math.abs(asset.lat) <= 90 && Number.isFinite(asset.lng) && Math.abs(asset.lng) <= 180,
    backing: 'Not verified by ATLAS',
    redemption: 'No redemption evidence supplied',
    audit: 'No audit evidence supplied',
  };
}

export function scenarioReport(name, rows, createdAt = new Date().toISOString()) {
  return { schema: 'atlas.research.v1', name, createdAt, mode: 'hypothetical',
    assumptions: ['User-defined illustrative values; not wallet balances or price predictions.',
      'Independent price shocks; no fees, yields, slippage, redemptions or liquidity modelling.',
      'No trades executed. No official Vibe Vibers XP, rewards or NFT ownership claim.'],
    result: analyzeScenario(rows) };
}

export function readSavedScenarios(storage) {
  try {
    const entries = JSON.parse(storage.getItem('atlas.research.scenarios.v1') || '[]');
    if (!Array.isArray(entries)) return [];
    return entries.slice(0, 6).filter(entry => {
      try { return typeof entry.id === 'string' && typeof entry.name === 'string' && entry.name.length <= 80 && typeof entry.createdAt === 'string' && Boolean(analyzeScenario(entry.rows)); }
      catch { return false; }
    });
  } catch { return []; }
}
