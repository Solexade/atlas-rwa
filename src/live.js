import { fetchTestnetTokens, readNativeBalance, normalizeTokenBalances, RH_TESTNET } from './rh';
import { calculateAtlasScore } from './score';

// Testnet Stock Token metadata is intentionally NOT sourced from the production
// Robinhood Stock Token API. The current API registry lists production chain
// deployments (chain 4663), while ATLAS runs against testnet 46630.
// Testnet token discovery therefore uses the Robinhood Chain Blockscout indexer.
export async function loadLiveRegistry() {
  const tokens = await fetchTestnetTokens();
  return {
    assets: normalizeTokenBalances(tokens),
    live: tokens !== null,
    source: 'Robinhood Chain Testnet Blockscout'
  };
}

export async function loadWalletSnapshot(address, assets = []) {
  if (!address) return null;

  const [native, balances] = await Promise.all([
    readNativeBalance(address),
    fetchTestnetTokens(address),
  ]);

  if (balances === null) {
    return {
      native,
      holdings: [],
      totalUsd: 0,
      chainId: RH_TESTNET.id,
      live: false,
      error: 'Unable to read the Robinhood Chain Testnet indexer.'
    };
  }

  const discovered = normalizeTokenBalances(balances);
  const configuredByAddress = new Map(
    assets.filter(a => a.contractAddress).map(a => [a.contractAddress.toLowerCase(), a])
  );

  // Prefer configured RWA metadata when a discovered contract matches it.
  const holdings = discovered
    .filter(a => Number(a.balance || 0) > 0)
    .map(a => ({
      ...a,
      ...(configuredByAddress.get(a.contractAddress?.toLowerCase()) || {}),
    }));

  // Token price data on testnet is not assumed to exist. If Blockscout exposes
  // an exchange rate we use it; otherwise value remains 0/N/A instead of inventing a quote.
  const total = holdings.reduce((sum, a) => sum + (Number(a.balance || 0) * Number(a.price || 0)), 0);
  const weighted = holdings.map(a => ({
    ...a,
    weight: total ? Number(((Number(a.balance || 0) * Number(a.price || 0) / total) * 100).toFixed(1)) : 0,
  }));

  return {
    native,
    holdings: weighted,
    totalUsd: total,
    chainId: RH_TESTNET.id,
    live: true,
    score: calculateAtlasScore(weighted),
  };
}
