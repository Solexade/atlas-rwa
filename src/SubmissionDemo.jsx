import React, { useState } from 'react';
import { DEMO_HOLDINGS, simulatePortfolio, checkConcentration } from './submission-model.js';

const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const RULE_KEY = 'atlas.concentration-rule.v1';

export function Simulation() {
  const [symbol, setSymbol] = useState('D-HOME');
  const [shock, setShock] = useState(-20);
  const result = simulatePortfolio(DEMO_HOLDINGS, symbol, shock);
  return <main className="wrap page">
    <div className="eyebrow">INTERACTIVE DEMO · NO WALLET REQUIRED</div>
    <h1>Explore an RWA scenario.</h1>
    <p className="lead">Change a hypothetical asset price and see the effect on a sample portfolio. Every asset, holding and price on this page is fictional.</p>
    <div className="demo-banner"><b>SIMULATION ONLY</b><span>No real assets, contract deployments, trades or wallet balances. Values are illustrative dollars.</span></div>
    <div className="demo-grid">
      <section className="panel demo-controls">
        <h2>Scenario inputs</h2>
        <label htmlFor="scenario-asset">Apply price change to</label>
        <select id="scenario-asset" className="field" value={symbol} onChange={e => setSymbol(e.target.value)}>
          <option value="all">Entire sample portfolio</option>
          {DEMO_HOLDINGS.map(a => <option key={a.symbol} value={a.symbol}>{a.name}</option>)}
        </select>
        <label htmlFor="scenario-shock">Hypothetical price change: <strong>{shock}%</strong></label>
        <input id="scenario-shock" type="range" min="-100" max="100" step="5" value={shock} onChange={e => setShock(Number(e.target.value))} />
        <div className="demo-presets">{[-50, -20, 0, 20].map(value => <button className="ghost" key={value} onClick={() => setShock(value)}>{value > 0 ? '+' : ''}{value}%</button>)}</div>
        <button className="ghost wide" onClick={() => { setSymbol('D-HOME'); setShock(-20); }}>Reset scenario</button>
        <p className="source-note">Calculation: units × starting price × (1 + price change). Units stay fixed; fees, yields and market liquidity are not modelled.</p>
      </section>
      <section className="panel" aria-live="polite">
        <h2>Simulated results</h2>
        <div className="demo-totals">
          <div><span>Starting value</span><strong data-testid="scenario-before">{money(result.before)}</strong></div>
          <div><span>Scenario value</span><strong data-testid="scenario-after">{money(result.after)}</strong></div>
          <div><span>Value change</span><strong data-testid="scenario-delta" className={result.delta < 0 ? 'negative' : 'positive'}>{money(result.delta)} ({result.changePercent.toFixed(1)}%)</strong></div>
        </div>
        <div className="demo-table-wrap"><table className="demo-table"><caption>Fictional holdings after the price change</caption><thead><tr><th>Asset</th><th>Units</th><th>Value</th><th>Weight</th></tr></thead><tbody>{result.holdings.map(a => <tr key={a.symbol}><th scope="row">{a.symbol}</th><td>{a.balance}</td><td>{money(a.price * a.balance)}</td><td>{a.weight.toFixed(1)}%</td></tr>)}</tbody></table></div>
        <p className="source-note">Illustrative Atlas Score: {result.score?.score ?? 'Unavailable'} / 100. This heuristic is not a credit rating or investment recommendation. With zero portfolio value, weights are zero and the score is unavailable.</p>
      </section>
    </div>
  </main>;
}

function readRule() {
  try {
    const rule = JSON.parse(localStorage.getItem(RULE_KEY));
    return rule && typeof rule.name === 'string' && rule.name.trim() && Number.isFinite(rule.threshold) && rule.threshold >= 1 && rule.threshold <= 100 ? rule : null;
  } catch { return null; }
}

export function RuleLab({ walletData }) {
  const [saved, setSaved] = useState(readRule);
  const [name, setName] = useState(saved?.name || 'Atlas Guard');
  const [threshold, setThreshold] = useState(saved?.threshold || 40);
  const [source, setSource] = useState('demo');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const save = event => {
    event.preventDefault();
    const rule = { name: name.trim(), threshold: Number(threshold) };
    if (!rule.name || !Number.isFinite(rule.threshold) || rule.threshold < 1 || rule.threshold > 100) { setMessage('Enter a name and a threshold from 1 to 100.'); return; }
    try { localStorage.setItem(RULE_KEY, JSON.stringify(rule)); setSaved(rule); setResult(null); setMessage('Rule saved in this browser.'); }
    catch { setMessage('Browser storage is unavailable. The rule was not saved.'); }
  };
  const run = () => {
    if (!saved) return;
    const holdings = source === 'demo' ? DEMO_HOLDINGS : walletData?.live ? walletData.holdings : [];
    const check = checkConcentration(holdings, saved.threshold);
    setResult({ check, source, name: saved.name, threshold: saved.threshold, time: new Date().toLocaleTimeString() });
  };
  return <main className="wrap page"><div className="eyebrow">AGENT PROTOTYPE · MANUAL SNAPSHOT CHECK</div><h1>Test a concentration rule.</h1>
    <p className="lead">Save one rule in this browser and run it against fictional demo holdings or the latest loaded testnet wallet snapshot. No background monitoring, notifications or transactions.</p>
    <div className="demo-grid">
      <form className="panel demo-controls" onSubmit={save}><h2>Configure your rule</h2><label htmlFor="rule-name">Rule name</label><input id="rule-name" className="field" maxLength="60" required value={name} onChange={e => setName(e.target.value)} /><label htmlFor="rule-threshold">Alert when one asset reaches this portfolio share (%)</label><input id="rule-threshold" className="field" type="number" min="1" max="100" required value={threshold} onChange={e => setThreshold(e.target.value)} /><button className="primary wide" type="submit">Save rule</button><p role="status">{message}</p></form>
      <section className="panel demo-controls"><h2>Run a check</h2><p>{saved ? `Saved: ${saved.name} · threshold ${saved.threshold}%` : 'Save a rule first.'}</p><label htmlFor="rule-source">Data source</label><select id="rule-source" className="field" value={source} onChange={e => { setSource(e.target.value); setResult(null); }}><option value="demo">Fictional demo portfolio</option><option value="wallet">Latest loaded testnet wallet snapshot</option></select><button className="primary wide" disabled={!saved} onClick={run}>Check saved rule</button>
      {result && <div className="answer" role="status"><b>{result.source === 'demo' ? 'SIMULATED RESULT' : 'WALLET SNAPSHOT RESULT'} · {result.time}</b><p>{!result.check ? 'No priced holdings available. Connect a wallet with indexed prices, or choose the demo portfolio.' : `${result.check.triggered ? 'Threshold reached' : 'Below threshold'}: ${result.check.symbol} is ${result.check.weight.toFixed(1)}% of priced value (rule: ${result.threshold}%).`}</p><span>Point-in-time check. Unpriced holdings are excluded.</span></div>}
      </section>
    </div></main>;
}
