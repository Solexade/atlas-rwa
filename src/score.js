export function calculateAtlasScore(holdings = []) {
  const valued = holdings.filter(h => Number(h.price) > 0 && Number(h.balance) > 0);
  if (!valued.length) return null;

  const total = valued.reduce((s, h) => s + Number(h.balance) * Number(h.price), 0);
  if (!total) return null;

  const weights = valued.map(h => (Number(h.balance) * Number(h.price)) / total);
  const hhi = weights.reduce((s, w) => s + w * w, 0);
  const diversification = Math.round(Math.max(0, Math.min(100, (1 - hhi) * 100)));
  const concentration = Math.round(Math.max(0, Math.min(100, 100 - Math.max(...weights) * 100)));
  const dataConfidence = Math.round(valued.reduce((s, h) => s + (h.live ? 100 : 40), 0) / valued.length);
  const liquidity = Math.round(valued.reduce((s, h) => s + (Number(h.holders) > 10 ? 90 : 60), 0) / valued.length);
  const score = Math.round(diversification * 0.35 + dataConfidence * 0.30 + liquidity * 0.20 + concentration * 0.15);

  return { score, diversification, dataConfidence, liquidity, concentration };
}
