# ATLAS — RWA Intelligence Prototype

A React + Vite MVP built for the vibe/vibe testnet builder quest on Robinhood Chain Testnet (46630).

## What works

- EVM wallet connection with chain switch/add, account changes and explicit local disconnect.
- Live token discovery and wallet holdings from the testnet Blockscout indexer. Indexed tokens are not automatically verified RWAs.
- Portfolio valuation and heuristic scoring for holdings with available prices. Missing prices are not invented.
- A separate **Simulation** page with fictional bond, property and commodity baskets. Price shocks update values, weights and illustrative scores immediately. No wallet required.
- An **Agents** prototype that saves one concentration rule in browser storage and checks a demo or loaded wallet snapshot manually. No background monitoring.
- Leaflet map, searchable registry, mobile navigation, bounded indexer requests and a refresh control.

## Run and verify

```sh
npm install
npm run dev
npm test
npm run build
```

The local URL uses `/atlas-rwa/` for GitHub Pages compatibility. `vercel.json` sets `npm run build -- --base=/` and output `dist` for Vercel.

## Vercel

Push the changes to GitHub, import `solexade/atlas-rwa`, choose Vite and leave the root directory at the repository root. The checked-in configuration supplies the build command and output directory. Use a current Node.js version supported by the installed Vite version (the development verification used Node 24).

No environment variables are required for the defaults. Optional public endpoint overrides:

```env
VITE_RH_TESTNET_RPC=https://rpc.testnet.chain.robinhood.com
VITE_RH_EXPLORER=https://explorer.testnet.chain.robinhood.com
VITE_RH_TESTNET_INDEXER=https://explorer.testnet.chain.robinhood.com/api
```

`VITE_` values are bundled into the browser: do not place secrets in them. The running MVP uses the testnet indexer, not the production Stock Token API. No automatic demo fallback replaces wallet data.

## Demo and submission

See [SUBMISSION.md](SUBMISSION.md) for an accurate project description, reproducible walkthrough and submission checklist. Hosting this frontend is separate from launching a project/token on vibe/vibe.

## Data and scope

Registry results are the first returned indexer page. Values are partial when prices are missing. The score combines diversification (35%), indexed-data availability (30%), a holder-count liquidity proxy (20%) and concentration (15%); it is not a verified risk rating. The map stays empty until geographic metadata exists. Simulation fixtures are fictional, contain no contract addresses and never enter live wallet calculations.

The local rule uses the latest loaded data, not a fresh request on each check. Reloading retains the saved rule but clears results. There are no background notifications, AI analysis, smart-contract deployments, automated trades, token utility or verified property ownership claims.

Testnet assets have no monetary value. Experimental software; not investment advice.

## License

MIT
