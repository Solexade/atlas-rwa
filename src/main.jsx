import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AreaChart, ArrowUpRight, Bot, BrainCircuit, ChevronDown, LogOut, ChevronRight, CircleDollarSign,
  Clock3, Database, ExternalLink, Globe2, Layers3, LineChart, LockKeyhole,
  Menu, Search, ShieldCheck, Sparkles, Target, TrendingDown, Wallet, X, Zap
} from 'lucide-react';
import { RH_TESTNET, shorten, fmtUsd } from './rh';
import { loadLiveRegistry, loadWalletSnapshot } from './live';
import './styles.css';
import { RuleLab } from './SubmissionDemo';
import { StressLab, EvidenceDesk } from './ResearchDesk';

const tabs = ['Terminal', 'Simulation', 'Portfolio', 'Agents', 'Markets', 'Evidence', 'About'];

function WalletControl({ wallet, connecting, connect, disconnect }) {
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const trigger = useRef(null);
  const disconnectButton = useRef(null);
  useEffect(() => { setOpen(false); }, [wallet]);
  useEffect(() => {
    if (!open) return;
    disconnectButton.current?.focus();
    const outside = event => { if (!container.current?.contains(event.target)) setOpen(false); };
    const escape = event => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  return <div className="wallet-control" ref={container} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button ref={trigger} className="wallet-btn" disabled={connecting} aria-expanded={wallet ? open : undefined} aria-controls={wallet ? 'wallet-panel' : undefined} onClick={() => wallet ? setOpen(value => !value) : connect()}>
      <Wallet size={15} />{wallet ? shorten(wallet) : connecting ? 'Connecting…' : 'Connect wallet'}{wallet && <ChevronDown size={14} />}
    </button>
    {open && wallet && <div id="wallet-panel" className="wallet-panel">
      <span className="eyebrow">CONNECTED WALLET</span><span className="wallet-address">{wallet}</span>
      <button ref={disconnectButton} className="wallet-disconnect" onClick={() => { setOpen(false); disconnect(); trigger.current?.focus(); }}><LogOut size={15} />Disconnect</button>
    </div>}
  </div>;
}

function App() {
  const [tab, setTab] = useState('Terminal');
  const [wallet, setWallet] = useState('');
  const [connecting, setConnecting] = useState(false);
  const connectingRef = useRef(false);
  const walletRef = useRef('');
  const [toast, setToast] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [liveAssets, setLiveAssets] = useState([]);
  const [walletData, setWalletData] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [registryStatus, setRegistryStatus] = useState('syncing');

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setRegistryStatus('syncing');
      const result = await loadLiveRegistry();
      if (!mounted) return;
      setLiveAssets(result.assets || []);
      setSelected(result.assets?.[0] || null);
      setRegistryStatus(result.live ? 'live' : 'offline');
    })().catch(() => { if (mounted) setRegistryStatus('offline'); });
    return () => { mounted = false; };
  }, [refreshKey]);

  useEffect(() => {
    if (!wallet) {
      setWalletData(null);
      setLiveLoading(false);
      return;
    }
    let mounted = true;
    setLiveLoading(true);
    loadWalletSnapshot(wallet, liveAssets)
      .then(data => mounted && setWalletData(data))
      .catch(() => mounted && setWalletData(null))
      .finally(() => mounted && setLiveLoading(false));
    return () => { mounted = false; };
  }, [wallet, liveAssets, refreshKey]);
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (!accounts || accounts.length === 0) {
        setWallet('');
        walletRef.current = '';
        setLiveLoading(false);
        setWalletData(null);
        setToast('Wallet disconnected');
        return;
      }

      if (!walletRef.current) return;
      walletRef.current = accounts[0];
      setWalletData(null);
      setWallet(accounts[0]);

    };

    const handleChainChanged = (chainId) => {
      if (parseInt(chainId, 16) !== RH_TESTNET.id) {
        setWallet('');
        walletRef.current = '';
        setWalletData(null);
        setLiveLoading(false);
        setToast('Wrong network. Reconnect to Robinhood Chain Testnet.');
      }
    };

    window.ethereum.on?.('accountsChanged', handleAccountsChanged);
    window.ethereum.on?.('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener?.(
        'accountsChanged',
        handleAccountsChanged
      );

      window.ethereum.removeListener?.(
        'chainChanged',
        handleChainChanged
      );
    };
  }, []);

  const connect = async () => {
    if (connectingRef.current) return;
    if (!window.ethereum) {
      setToast('No EVM wallet detected. Please install a compatible wallet.');
      return;
    }

    connectingRef.current = true;
    setConnecting(true);
    try {
      setToast('Waiting for wallet confirmation…');

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || !accounts.length) {
        setToast('No wallet account was selected.');
        return;
      }

      const account = accounts[0];

      let chainId = await window.ethereum.request({
        method: 'eth_chainId'
      });

      if (parseInt(chainId, 16) !== RH_TESTNET.id) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [
              {
                chainId: `0x${RH_TESTNET.id.toString(16)}`
              }
            ]
          });
        } catch (err) {
          if (err?.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${RH_TESTNET.id.toString(16)}`,
                  chainName: RH_TESTNET.name,
                  nativeCurrency: RH_TESTNET.nativeCurrency,
                  rpcUrls: RH_TESTNET.rpcUrls.default.http,
                  blockExplorerUrls: [
                    RH_TESTNET.blockExplorers.default.url
                  ]
                }
              ]
            });
          } else {
            throw err;
          }
        }

        chainId = await window.ethereum.request({
          method: 'eth_chainId'
        });
      }

      if (parseInt(chainId, 16) !== RH_TESTNET.id) {
        setToast('Please switch to Robinhood Chain Testnet.');
        return;
      }

      walletRef.current = account;
      setWallet(account);


      setToast(`Wallet connected · ${shorten(account)}`);

    } catch (err) {
      console.error('Wallet connection error:', err);

      if (err?.code === 4001) {
        setToast('Wallet connection cancelled.');
      } else {
        setToast(err?.message || 'Unable to connect wallet.');
      }
    } finally {
      connectingRef.current = false;
      setConnecting(false);
    }
  };
  const disconnect = () => {
    setWallet('');
    walletRef.current = '';
    setLiveLoading(false);
    setWalletData(null);
    setToast('Wallet disconnected from ATLAS');
  };

  const filtered = useMemo(
    () => liveAssets.filter(a => (a.symbol + a.name + a.sector).toLowerCase().includes(query.toLowerCase())),
    [query, liveAssets]
  );

  const nav = n => { setTab(n); setMobileOpen(false); };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand" onClick={() => nav('Terminal')}>
            <span className="brand-mark"><Globe2 size={17} /></span>
            <span>ATLAS<em>RWA intelligence</em></span>
          </button>
          <nav id="main-navigation" aria-label="Main navigation" className={mobileOpen ? 'nav-open' : ''}>{tabs.map(t => <button key={t} onClick={() => nav(t)} className={tab === t ? 'active' : ''}>{t}</button>)}</nav>
          <div className="top-actions">
            <span className="network"><span className="live-dot" /> RH TESTNET</span>
            <WalletControl wallet={wallet} connecting={connecting} connect={connect} disconnect={disconnect} />
            <button className="mobile-menu" aria-label="Toggle navigation" aria-expanded={mobileOpen} aria-controls="main-navigation" onClick={() => setMobileOpen(value => !value)}><Menu size={17} /></button>
          </div>
        </div>
      </header>

      <div className="submission-strip"><span><b>TESTNET MVP</b> · Built for the vibe/vibe builder quest</span><button className="ghost" onClick={() => nav('Simulation')}>Try the simulation</button></div>
      {tab === 'Simulation' && <StressLab />}
      {tab === 'Evidence' && <EvidenceDesk assets={liveAssets} status={registryStatus} />}
      {tab === 'Terminal' && <Terminal assets={filtered} selected={selected} setSelected={setSelected} query={query} setQuery={setQuery} wallet={wallet} onAgent={() => nav('Agents')} onSimulation={() => nav('Simulation')} walletData={walletData} liveLoading={liveLoading} registryStatus={registryStatus} onRefresh={() => setRefreshKey(value => value + 1)} />}
      {tab === 'Portfolio' && <Portfolio wallet={wallet} connect={connect} walletData={walletData} />}
      {tab === 'Agents' && <RuleLab walletData={walletData} />}
      {tab === 'Markets' && <Markets query={query} setQuery={setQuery} rows={liveAssets} registryStatus={registryStatus} />}
      {tab === 'About' && <About />}

      {toast && <div className="toast"><ShieldCheck size={15} />{toast}</div>}
      <footer>
        <span>ATLAS · Testnet RWA intelligence</span>
        <span>Robinhood Chain Testnet · {RH_TESTNET.id} · <a href={RH_TESTNET.blockExplorers.default.url} target="_blank" rel="noreferrer">Explorer <ExternalLink size={12} /></a></span>
      </footer>
    </div>
  );
}

function Terminal({ assets: rows, selected, setSelected, query, setQuery, wallet, onAgent, onSimulation, walletData, liveLoading, registryStatus, onRefresh }) {
  const score = walletData?.score;
  const statusLabel = registryStatus === 'live' ? 'INDEXER LIVE' : registryStatus === 'syncing' ? 'SYNCING' : 'INDEXER OFFLINE';
  const activity = walletData?.holdings?.length
    ? walletData.holdings.slice(0, 4).map(a => ({ symbol: a.symbol, type: 'BALANCE', text: `${a.symbol} balance indexed`, time: 'now', tone: 'up' }))
    : [{ symbol: 'TESTNET', type: 'INDEX', text: registryStatus === 'live' ? 'Testnet indexer connected' : 'Waiting for testnet indexer', time: 'now', tone: 'neutral' }];

  return (
    <main>
      <section className="hero">
        <div className="hero-grid">
          <div>
            <div className="eyebrow"><span className="live-dot" /> ONCHAIN RWA INTELLIGENCE</div>
            <h1>See the assets.<br /><span>Understand the risk.</span></h1>
            <p>Explore indexed testnet tokens and wallet analytics, then test hypothetical RWA price changes in a separate simulation. Built for Robinhood Chain Testnet.</p>
            <div className="hero-actions">
              <button className="primary" onClick={onAgent}><Bot size={16} /> Configure a local rule <ArrowUpRight size={14} /></button>
              <button className="ghost" onClick={() => document.getElementById('market-map')?.scrollIntoView({ behavior: 'smooth' })}>Explore assets <ChevronRight size={15} /></button>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-top"><span>ATLAS SCORE</span><span className="score-chip">{score ? 'LIVE' : 'AWAITING DATA'}</span></div>
            <div className="hero-score">
              {score?.score ?? '—'}
              <span>/100</span>
            </div>
            {score ? <div className="score-bars"><Bar label="Diversification" value={score.diversification} /><Bar label="Data confidence" value={score.dataConfidence} /><Bar label="Liquidity proxy" value={score.liquidity} /><Bar label="Concentration" value={score.concentration} /></div> : <div className="empty-score">Connect a wallet with priced testnet assets to calculate a source-backed score.</div>}
            <div className="source-row"><Database size={13} /> Sources: {walletData ? 'wallet · testnet indexer' : 'Robinhood Chain Testnet indexer'} {liveLoading ? '· syncing…' : ''}</div>
          </div>
        </div>
      </section>

      <section className="wrap">
        <div className="kpi-grid">
          <Kpi icon={<CircleDollarSign />} label="Priced token value" value={walletData ? fmtUsd(walletData.totalUsd) : '—'} sub={walletData ? `${walletData.holdings.length} onchain holdings` : 'Connect wallet'} />
          <Kpi icon={<Target />} label="Atlas score" value={score ? `${score.score} / 100` : '—'} sub={score ? 'Calculated from wallet data' : 'Requires priced holdings'} />
          <Kpi icon={<Zap />} label="Rule prototype" value="1" sub="Saved locally · manual checks" />
          <Kpi icon={<Clock3 />} label="Data source" value={statusLabel} sub="Robinhood Chain Testnet" />
        </div>

        <div className="data-status" role="status"><span>{registryStatus === 'syncing' ? 'Loading the testnet indexer…' : registryStatus === 'offline' ? 'Indexer unavailable. Try again or explore the offline simulation.' : 'Live indexer snapshot. Token listings are not verified RWAs.'}</span><button className="ghost" disabled={registryStatus === 'syncing' || liveLoading} onClick={onRefresh}>Refresh data</button><button className="ghost" onClick={onSimulation}>Open simulation</button></div>
        <div className="section-head"><div><div className="eyebrow">TESTNET ASSET LAYER</div><h2>RWA market map</h2></div><div className="searchbox"><Search size={15} /><input aria-label="Search indexed tokens" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search token, sector…" /></div></div>
        <div className="terminal-grid" id="market-map">
          <div className="map-card"><MarketMap rows={rows} selected={selected} setSelected={setSelected} /><div className="map-caption"><span>Markers appear only when verified geospatial metadata exists.</span><span>Map data © OpenStreetMap</span></div></div>
          <div className="asset-panel">
            {selected ? <>
              <div className="eyebrow">SELECTED TESTNET TOKEN</div>
              <AssetDetail asset={selected} />
              <button className="primary wide" onClick={onSimulation}>Explore fictional RWA scenario <LineChart size={15} /></button>
              <div className="source-card"><div><ShieldCheck size={15} /> Provenance</div><span>Contract: {selected.contractAddress ? `${selected.contractAddress.slice(0, 8)}…${selected.contractAddress.slice(-6)}` : 'Not indexed'}</span><span>Source: {selected.source || 'Testnet indexer'}</span><span>Price: {selected.price > 0 ? 'indexed exchange rate' : 'not available'}</span></div>
            </> : <div className="empty-state"><Layers3 size={20} /><b>No indexed token selected</b><p>The testnet indexer has not returned an asset yet.</p></div>}
          </div>
        </div>

        <div className="two-col">
          <section className="panel"><div className="section-head compact"><div><div className="eyebrow">ACTIVITY</div><h3>Onchain data stream</h3></div><span className="status">● {statusLabel}</span></div>{activity.map((a, i) => <div className="activity" key={i}><div className={`activity-icon ${a.tone}`}><Database size={14} /></div><div><b>{a.text}</b><small>{a.symbol} · {a.type}</small></div><time>{a.time}</time></div>)}</section>
          <section className="panel"><div className="section-head compact"><div><div className="eyebrow">PORTFOLIO ANALYSIS</div><h3>Concentration check</h3></div><BrainCircuit size={18} /></div><div className="ask-box"><Sparkles size={17} /><span>{walletData?.holdings?.length ? '“What is my largest onchain concentration?”' : 'Test a saved concentration rule using demo or wallet data.'}</span><button aria-label="Open concentration rule checker" onClick={onAgent}><ArrowUpRight size={15} /></button></div><div className="answer"><b>{walletData?.holdings?.length ? 'Source-backed analysis ready' : 'No portfolio claim yet'}</b><p>{walletData?.holdings?.length ? 'ATLAS uses indexed balances and available price data. Assets without a verified price are excluded from value-weighted scoring.' : 'ATLAS deliberately avoids inventing portfolio balances or prices when the testnet does not provide them.'}</p><span>Deterministic data layer · no execution</span></div></section>
        </div>

        <div className="disclaimer"><LockKeyhole size={15} /><div><b>Testnet & data disclaimer</b><p>ATLAS is experimental software. Testnet assets have no monetary value. Robinhood's public testnet RPC and indexed data can be rate-limited. ATLAS does not treat a matching ticker as proof of canonical status and does not represent testnet tokens as ownership of an underlying security.</p></div></div>
      </section>
    </main>
  );
}

function Portfolio({ wallet, connect, walletData }) {
  const score = walletData?.score;
  return <main className="wrap page">
    <div className="eyebrow">PORTFOLIO INTELLIGENCE</div><h1>Your indexed testnet holdings.</h1>
    <p className="lead">ATLAS reads the connected Robinhood Chain Testnet address through the chain indexer. No demo holdings are substituted when your wallet is empty.</p>
    {!wallet && <button className="primary" onClick={connect}><Wallet size={16} /> Connect wallet</button>}
    {wallet && <div className="wallet-state">Connected: <b>{shorten(wallet)}</b> · Chain {walletData?.chainId || RH_TESTNET.id}</div>}
    {walletData?.error && <div className="notice" role="alert">{walletData.error} No balance conclusion can be drawn from this failed read. Use Refresh data on the Terminal to retry.</div>}
    <div className="portfolio-grid">
      <section className="panel big-panel"><div className="portfolio-total"><span>Tracked value</span><b>{walletData ? fmtUsd(walletData.totalUsd) : wallet ? 'Syncing…' : '—'}</b><small>{walletData?.live ? 'Live testnet indexer reads' : 'Connect a wallet to read testnet balances'}</small></div><div className="allocation">{walletData?.holdings?.length ? walletData.holdings.map(a => <div key={a.contractAddress || a.symbol}><span><i style={{ background: a.color }} />{a.symbol}</span><b>{a.weight}%</b><div className="alloc-bar"><i style={{ width: `${Math.min(100, a.weight)}%`, background: a.color }} /></div></div>) : <div className="empty-state"><Layers3 size={18} /><b>No holdings to display</b><p>Once a testnet RWA token is held by this address, it will appear here.</p></div>}</div></section>
      <section className="panel"><div className="eyebrow">RISK SNAPSHOT</div>{score ? <div className="risk"><Bar label="Diversification" value={score.diversification} /><Bar label="Concentration" value={score.concentration} /><Bar label="Liquidity proxy" value={score.liquidity} /><Bar label="Data confidence" value={score.dataConfidence} /></div> : <div className="empty-state"><Target size={18} /><b>Score unavailable</b><p>ATLAS needs at least one priced onchain holding to calculate the current score.</p></div>}</section>
    </div>
    <section className="panel"><div className="section-head compact"><div><div className="eyebrow">HOLDINGS</div><h3>Indexed assets</h3></div><span className="status">{walletData?.holdings?.length || 0} HELD</span></div>{walletData?.holdings?.length ? walletData.holdings.map(a => <div className="holding" key={a.contractAddress || a.symbol}><div className="asset-logo" style={{ background: a.color }}>{a.symbol[0]}</div><div><b>{a.symbol}</b><small>{a.name} · {a.sector}</small></div><strong>{a.price > 0 ? fmtUsd(a.price) : '—'}</strong><span>{a.price > 0 ? `${a.weight}%` : 'No price'}</span><span>{a.contractAddress?.slice(0, 6)}…</span></div>) : <div className="empty-row">{walletData?.error ? 'Holdings unavailable because the indexer request failed.' : walletData ? 'No non-zero ERC-20 balances were indexed for this wallet.' : wallet ? 'Loading wallet holdings…' : 'Connect a wallet to load its holdings.'}</div>}</section>
  </main>;
}

function Markets({ query, setQuery, rows, registryStatus }) {
  const filtered = rows.filter(a => (a.symbol + a.name + a.sector).toLowerCase().includes(query.toLowerCase()));
  return <main className="wrap page"><div className="section-head"><div><div className="eyebrow">TESTNET MARKET DATA</div><h1>Indexed token registry.</h1></div><div className="searchbox"><Search size={15} /><input aria-label="Search indexed tokens" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search assets…" /></div></div><div className="panel table">{filtered.length ? filtered.map(a => <div className="market-row" key={a.contractAddress || a.symbol}><div className="asset-logo" style={{ background: a.color }}>{a.symbol[0]}</div><div><b>{a.symbol}</b><small>{a.name}</small></div><span>{a.sector}</span><strong>{a.price > 0 ? fmtUsd(a.price) : '—'}</strong><span>{a.holders ? `${a.holders} holders` : 'Indexed'}</span><button className="icon" onClick={() => window.open(`${RH_TESTNET.blockExplorers.default.url}/address/${a.contractAddress}`, '_blank', 'noopener,noreferrer')}><ExternalLink size={14} /></button></div>) : <div className="empty-row">{registryStatus === 'syncing' ? 'Syncing testnet token index…' : 'No testnet ERC-20 tokens returned by the indexer.'}</div>}</div><div className="source-note"><Database size={14} /><span>Source: Robinhood Chain Testnet Blockscout indexer. Indexed metadata is not proof that a token represents an underlying real-world asset.</span></div></main>;
}

function About() {
  return <main className="wrap page"><div className="eyebrow">ABOUT ATLAS</div><h1>The intelligence layer for onchain RWAs.</h1><p className="lead">ATLAS is designed around a simple idea: tokenized real-world assets become more useful when their data, provenance and portfolio context are easy to understand.</p><div className="about-grid">{[['01', 'READ', 'Read indexed testnet token metadata and wallet balances.'], ['02', 'PRICE', 'Use indexer exchange rates when available; missing prices stay unavailable.'], ['03', 'EXPLAIN', 'Explore portfolio metrics and clearly labelled fictional RWA scenarios.'], ['04', 'AGENT', 'Save a local concentration rule and manually check a snapshot.']].map(x => <div className="panel about-card" key={x[0]}><span>{x[0]}</span><h3>{x[1]}</h3><p>{x[2]}</p></div>)}</div><div className="disclaimer"><LockKeyhole size={15} /><div><b>Important</b><p>ATLAS does not issue or tokenize securities. It composes with existing onchain assets. Nothing in the interface is an offer, recommendation or valuation of a security. Testnet assets have no monetary value.</p></div></div></main>;
}

function AssetDetail({ asset }) {
  return <div className="asset-detail"><div className="asset-title"><div className="asset-logo" style={{ background: asset.color }}>{asset.symbol[0]}</div><div><h3>{asset.symbol}</h3><p>{asset.name} · {asset.sector}</p></div></div><div className="asset-price">{asset.price > 0 ? fmtUsd(asset.price) : '—'}<small>{asset.price > 0 ? 'indexed exchange rate' : 'price unavailable on testnet'}</small></div><div className="detail-grid"><span>Balance<b>{asset.balance > 0 ? asset.balance.toLocaleString() : '—'}</b></span><span>Holders<b>{asset.holders || '—'}</b></span><span>Contract<b>{asset.contractAddress ? `${asset.contractAddress.slice(0, 8)}…` : '—'}</b></span><span>Network<b>RH Testnet</b></span></div></div>;
}

function Bar({ label, value }) { return <div className="bar"><div><span>{label}</span><b>{value}</b></div><i><em style={{ width: `${value}%` }} /></i></div>; }
function Kpi({ icon, label, value, sub }) { return <div className="kpi"><span className="kpi-icon">{icon}</span><div><small>{label}</small><b>{value}</b><em>{sub}</em></div></div>; }

function MarketMap({ rows, selected, setSelected }) {
  const container = useRef(null);
  const map = useRef(null);
  const markers = useRef(new Map());
  const selectedKey = selected?.contractAddress || selected?.symbol;
  const located = useMemo(() => rows.filter(a => Number.isFinite(a.lat) && Number.isFinite(a.lng) && Math.abs(a.lat) <= 90 && Math.abs(a.lng) <= 180), [rows]);
  useEffect(() => {
    const instance = L.map(container.current, { zoomControl: false, preferCanvas: true, wheelDebounceTime: 20 }).setView([10.29, 11.17], 6);
    map.current = instance;
    L.control.zoom({ position: 'bottomright' }).addTo(instance);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, updateWhenIdle: true, keepBuffer: 2, attribution: '© OpenStreetMap' }).addTo(instance);
    const observer = new ResizeObserver(() => instance.invalidateSize({ pan: false }));
    observer.observe(container.current);
    return () => { observer.disconnect(); markers.current.clear(); instance.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    const instance = map.current;
    const active = new Set();
    located.forEach(asset => {
      const key = asset.contractAddress || asset.symbol;
      active.add(key);
      let entry = markers.current.get(key);
      if (!entry) {
        const marker = L.circleMarker([asset.lat, asset.lng], { radius: 7, weight: 2, color: '#07100d', fillColor: asset.color, fillOpacity: .95 }).addTo(instance);
        entry = { marker, asset };
        marker.on('click', () => setSelected(entry.asset));
        markers.current.set(key, entry);
      }
      entry.asset = asset;
      entry.marker.setLatLng([asset.lat, asset.lng]).setStyle({ fillColor: asset.color });
      const tooltip = document.createElement('div');
      tooltip.style.whiteSpace = 'pre-line';
      tooltip.textContent = [asset.symbol, asset.name, asset.price > 0 ? Number(asset.price).toFixed(2) : 'No indexed price'].join('\n');
      entry.marker.unbindTooltip().bindTooltip(tooltip, { direction: 'top' });
    });
    for (const [key, entry] of markers.current) {
      if (!active.has(key)) { entry.marker.remove(); markers.current.delete(key); }
    }
  }, [located, setSelected]);
  useEffect(() => {
    for (const [key, { marker }] of markers.current) marker.setRadius(key === selectedKey ? 10 : 7);
  }, [selectedKey, located]);
  return <div className="map-wrap"><div id="atlas-map" ref={container} aria-label="Asset location map" />{!located.length && <div className="map-empty"><Layers3 size={18} /><span>Awaiting verified RWA geospatial metadata</span></div>}</div>;
}

createRoot(document.getElementById('root')).render(<App />);
