# ATLAS — RWA Intelligence Terminal

A clean, Vite + React + Tailwind MVP for a utility/RWA testnet application on Robinhood Chain.

## Product thesis

**ATLAS is the intelligence layer for onchain real-world assets.** It combines wallet context, canonical RWA metadata, market data, risk scoring and AI agents into one interface.

The MVP intentionally does not tokenize or claim ownership of real-world property. It composes with existing tokenized assets and labels all demo data clearly.

## Current MVP

- Dark, production-oriented terminal UI
- Robinhood Chain Testnet network constants (chain ID 46630)
- Real OpenStreetMap/Leaflet market map visual layer
- Portfolio, Markets, Agents and About views
- Demo RWA asset registry and portfolio analytics
- Agent creation flow with execution disabled
- Provenance/source language throughout the UI
- Optional browser-wallet connection (falls back to clearly labelled demo mode)
- API adapter hooks for Robinhood Stock Token metadata and price endpoints
- `.env.example` for testnet/API configuration

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Live-data adapter

The browser app defaults to demo fixtures so the repository is safe to run immediately. To connect a production backend, set:

```env
VITE_RH_TESTNET_RPC=https://rpc.testnet.chain.robinhood.com
VITE_RH_TESTNET_CHAIN_ID=46630
VITE_RH_EXPLORER=https://explorer.testnet.chain.robinhood.com
VITE_RH_ASSET_API=/api/rh/assets
VITE_RH_PRICE_API=/api/rh/prices
```

The recommended production pattern is a small server-side proxy for the Robinhood Stock Token API so secrets, caching, rate limits and normalization stay off the client.

## Architecture next step

1. Replace demo asset rows with canonical contract data from the Robinhood asset registry.
2. Read wallet ERC-20 balances from Robinhood Chain Testnet.
3. Add Chainlink price reads where appropriate.
4. Add an ATLAS utility-token contract for premium analysis/agent slots.
5. Store agent configuration and runs in a small backend.
6. Keep execution disabled until the product has a clear safety and permission model.

## Safety / disclosures

ATLAS is experimental software. Robinhood Chain Testnet tokens have no monetary value. ATLAS is not a broker, exchange, investment adviser, custodian, issuer or tokenizer of securities. Stock Tokens are tokenized debt securities and do not grant legal or beneficial rights in the underlying securities. The application is informational and does not provide investment advice.

## License

MIT
