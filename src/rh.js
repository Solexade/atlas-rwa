import { createPublicClient, http, formatUnits } from 'viem';

export const RH_TESTNET = {
  id: 46630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [import.meta.env.VITE_RH_TESTNET_RPC || 'https://rpc.testnet.chain.robinhood.com'] } },
  blockExplorers: { default: { name: 'Robinhood Explorer', url: import.meta.env.VITE_RH_EXPLORER || 'https://explorer.testnet.chain.robinhood.com' } },
};

export const BLOCKSCOUT_API = import.meta.env.VITE_RH_TESTNET_INDEXER || `${RH_TESTNET.blockExplorers.default.url}/api`;
export const RH_API = import.meta.env.VITE_RH_ASSET_API || 'https://api.robinhood.com/rhj/assets';
export const RH_PRICE_API = import.meta.env.VITE_RH_PRICE_API || 'https://api.robinhood.com/rhj/prices';

export const publicClient = createPublicClient({
  chain: {
    id: RH_TESTNET.id,
    name: RH_TESTNET.name,
    nativeCurrency: RH_TESTNET.nativeCurrency,
    rpcUrls: RH_TESTNET.rpcUrls,
  },
  transport: http(RH_TESTNET.rpcUrls.default.http[0], { timeout: 12000, retryCount: 1 }),
});

export const ERC20_ABI = [
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint8' }] },
  { type: 'function', name: 'symbol', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'string' }] },
  { type: 'function', name: 'name', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'string' }] },
  { type: 'function', name: 'uiMultiplier', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
];

export const shorten = (value='') => value ? `${value.slice(0,6)}…${value.slice(-4)}` : '';
export const fmtUsd = value => Number(value) > 0
  ? new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(Number(value))
  : '—';

export async function readNativeBalance(address){
  try {
    const value = await publicClient.getBalance({ address });
    return Number(formatUnits(value, 18));
  } catch { return null; }
}

export async function readTokenBalance(address, token){
  try {
    const [balance, decimals] = await Promise.all([
      publicClient.readContract({ address: token, abi: ERC20_ABI, functionName: 'balanceOf', args: [address] }),
      publicClient.readContract({ address: token, abi: ERC20_ABI, functionName: 'decimals' }),
    ]);
    return Number(formatUnits(balance, decimals));
  } catch { return null; }
}

/**
 * Reads indexed ERC-20 balances from the official Robinhood Chain Testnet
 * Blockscout instance. This avoids pretending the production Stock Token API
 * is a testnet registry.
 */
export async function fetchTestnetTokens(address){
  try {
    const path = address
      ? `/v2/addresses/${encodeURIComponent(address)}/token-balances`
      : '/v2/tokens/?type=ERC-20';
    const r = await fetch(`${BLOCKSCOUT_API}${path}`, { signal: AbortSignal.timeout(12000), headers: { accept: 'application/json' } });
    if (!r.ok) throw new Error(`testnet indexer ${r.status}`);
    return await r.json();
  } catch {
    return null;
  }
}

export function normalizeTokenBalances(payload){
  const list = Array.isArray(payload) ? payload : (payload?.items || []);
  return list.map((item, index) => {
    const token = item?.token || item;
    const address = token?.address_hash || token?.address || token?.contractAddress || '';
    const decimals = Number(token?.decimals ?? 18);
    const raw = item?.value ?? token?.value ?? '0';
    const balance = Number(raw) / (10 ** decimals);
    const exchangeRate = Number(token?.exchange_rate ?? token?.exchangeRate ?? 0);
    const symbol = token?.symbol || token?.name?.slice(0, 8) || `TOKEN${index + 1}`;
    return {
      symbol,
      name: token?.name || symbol,
      sector: 'Testnet token',
      price: exchangeRate,
      change: 0,
      weight: 0,
      balance,
      contractAddress: address,
      decimals,
      holders: Number(token?.holders_count || 0),
      live: true,
      lat: null,
      lng: null,
      color: '#6ee7b7',
      source: 'Robinhood Chain Testnet Blockscout',
    };
  }).filter(a => a.contractAddress);
}

// Kept for compatibility with earlier builds. Production Robinhood Stock Token
// metadata is useful only when the requested deployment chain is 4663.
export async function fetchStockAssets(){
  try {
    const r = await fetch(RH_API, { headers: { accept: 'application/json' } });
    if(!r.ok) throw new Error(`asset api ${r.status}`);
    return await r.json();
  } catch { return null; }
}

export async function fetchStockPrice(symbol){
  try {
    const r = await fetch(`${RH_PRICE_API}/${encodeURIComponent(symbol)}`, { headers: { accept: 'application/json' } });
    if(!r.ok) throw new Error(`price api ${r.status}`);
    return await r.json();
  } catch { return null; }
}

export function canonicalAssetsFromApi(payload){
  const list = payload?.assets || [];
  return list.filter(asset => asset.status === 'ASSET_STATUS_ACTIVE')
    .map(asset => ({ ...asset, deployment: asset.deployments?.find(d => Number(d.chainId) === RH_TESTNET.id) }))
    .filter(asset => asset.deployment?.contractAddress);
}
