export const COINGECKO_API =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether&vs_currencies=usd";

export async function fetchPrices() {
  try {
    const resp = await fetch(COINGECKO_API);
    if (!resp.ok) throw new Error("price fetch failed");
    const data = await resp.json();
    return {
      BTC: data.bitcoin.usd,
      ETH: data.ethereum.usd,
      SOL: data.solana.usd,
      USDT: data.tether.usd,
    };
  } catch (e) {
    return {
      BTC: 30000,
      ETH: 2000,
      SOL: 30,
      USDT: 1,
    };
  }
}