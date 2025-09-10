import { useState } from "react";
import { useUser } from "../context/UserContext";

const ASSETS = [
  { symbol: "BTC", label: "Bitcoin" },
  { symbol: "ETH", label: "Ethereum" },
  { symbol: "SOL", label: "Solana" },
  { symbol: "USDT", label: "Tether (USDT)" }
];

export default function BuyForm({ prices, showToast }) {
  const { user, updateUser } = useUser();
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState("BTC");

  if (!user) return <div className="muted">Please login to buy (demo)</div>;

  function formatNum(n){
    if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, {maximumFractionDigits: 2});
    return Number(n.toFixed(6)).toString().replace(/\.?0+$/, '');
  }

  function onBuy(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      showToast && showToast("error", "Enter a positive USD amount");
      return;
    }
    const price = prices[asset];
    const acquired = amt / price;
    const newUser = { ...user };
    if (!newUser.portfolio) newUser.portfolio = {};
    newUser.portfolio[asset] = (newUser.portfolio[asset] || 0) + acquired;
    const tx = {
      id: "tx_" + Date.now(),
      type: "BUY",
      asset: asset,
      amount_asset: acquired,
      amount_usd: amt,
      amount_display: `+${formatNum(acquired)} ${asset} ($${formatNum(amt)})`,
      created_at: new Date().toISOString()
    };
    newUser.transactions = newUser.transactions || [];
    newUser.transactions.push(tx);
    updateUser(newUser);
    setAmount("");
    showToast && showToast("success", `Bought ${formatNum(acquired)} ${asset} for $${formatNum(amt)} (demo)`);
  }

  return (
    <div>
      <h4>Buy Crypto</h4>
      <form onSubmit={onBuy} id="buy-form">
        <label>Asset</label>
        <select value={asset} onChange={e => setAsset(e.target.value)}>
          {ASSETS.map(a => (
            <option key={a.symbol} value={a.symbol}>{a.label}</option>
          ))}
        </select>
        <label>Amount (USD)</label>
        <input type="number" min="1" step="any" placeholder="e.g., 50" required value={amount} onChange={e => setAmount(e.target.value)} />
        <div className="muted small">Price: <span id="form-price">${prices[asset]?.toLocaleString(undefined, {maximumFractionDigits:2})}</span></div>
        <button type="submit" className="primary">Buy {asset}</button>
      </form>

      <h4 style={{marginTop: "1rem"}}>Investment Options</h4>
      <div className="invest-options" style={{display:"flex",gap:8}}>
        {[25,50,100,250].map(a => (
          <button key={a} className="option" onClick={()=>setAmount(a)}>${a}</button>
        ))}
      </div>
    </div>
  );
}