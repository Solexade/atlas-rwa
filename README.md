# ATLAS - RWA Research Workspace

ATLAS is a React + Vite MVP for the vibe/vibe testnet builder quest on Robinhood Chain Testnet (46630).

## Working features

- Testnet token discovery and wallet holdings from the Blockscout indexer, with explicit wallet disconnect and bounded requests.
- Portfolio metrics for priced holdings; missing prices are not invented.
- **Simulation / Stress Lab:** create up to 12 hypothetical positions with independent price shocks, inspect allocations, save up to six scenarios locally, compare results, and download text or JSON reports.
- **Evidence:** search loaded registry records, inspect sources and contracts, see missing backing/redemption/audit evidence, and export an evidence report.
- **Agents:** save a concentration threshold locally and manually check demo or loaded wallet data. No background monitoring.
- Responsive navigation, searchable registry and a map that stays empty when geographic data is unavailable.

## Run and verify

```sh
npm install
npm run dev
npm test
npm run build
```

Local development uses `/atlas-rwa/`. Vercel uses `npm run build -- --base=/` and `dist`, as configured in `vercel.json`. Verification used Node 24.

Production: https://atlas-rwa.vercel.app/

Optional public endpoint overrides are `VITE_RH_TESTNET_RPC`, `VITE_RH_EXPLORER` and `VITE_RH_TESTNET_INDEXER`. Never put secrets in `VITE_` variables. Defaults require no environment configuration.

## Data and limits

Registry coverage is the first indexer page. Indexed tokens, tickers, prices and holder counts are not proof of real-world backing, liquidity, redemption rights or audits. Source update time is not supplied; report export time is explicitly different. Atlas Score is a deterministic heuristic, not a verified risk rating.

Research scenarios are hypothetical and exclude fees, yields, slippage, redemptions and liquidity effects. They never enter wallet calculations or execute trades. Saved scenarios and rules belong to one browser; downloads provide portable reports.

There is no official Vibe Vibers NFT verification, official XP, reward eligibility calculation, token gating, automated trading or deployed token utility. Future integration requires verified collection/network details and a separately tested implementation. Rewards remain subject to platform review.

See [SUBMISSION.md](SUBMISSION.md) for a reproducible demo. Testnet assets have no monetary value. Experimental software; not investment advice.

## License

MIT
