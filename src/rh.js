export const RH_TESTNET = { id: 46630, name:'Robinhood Chain Testnet', nativeCurrency:{name:'Ether',symbol:'ETH',decimals:18}, rpcUrls:{default:{http:[import.meta.env.VITE_RH_TESTNET_RPC || 'https://rpc.testnet.chain.robinhood.com']}}, blockExplorers:{default:{name:'Robinhood Explorer',url:import.meta.env.VITE_RH_EXPLORER || 'https://explorer.testnet.chain.robinhood.com'}} };
export const shorten = (value='') => value ? `${value.slice(0,6)}…${value.slice(-4)}` : '';
export const fmtUsd = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(value);
export async function fetchStockAssets(){
  const base = import.meta.env.VITE_RH_ASSET_API;
  if(!base) return null;
  try { const r = await fetch(base); if(!r.ok) throw new Error('asset api failed'); return await r.json(); } catch { return null; }
}
export async function fetchStockPrice(symbol){
  const base = import.meta.env.VITE_RH_PRICE_API;
  if(!base) return null;
  try { const r = await fetch(`${base}/${symbol}`); if(!r.ok) throw new Error('price api failed'); return await r.json(); } catch { return null; }
}
