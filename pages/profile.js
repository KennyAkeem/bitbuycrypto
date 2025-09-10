import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { fetchPrices } from "../lib/prices";

const ASSETS = [
  { symbol: "BTC", label: "Bitcoin" },
  { symbol: "ETH", label: "Ethereum" },
  { symbol: "SOL", label: "Solana" },
  { symbol: "USDT", label: "Tether (USDT)" }
];

export default function ProfilePage({ showToast }) {
  const { user, updateUser } = useUser();
  const router = useRouter();
  const [prices, setPrices] = useState({
    BTC: 30000,
    ETH: 2000,
    SOL: 30,
    USDT: 1
  });
  const [asset, setAsset] = useState("BTC");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    fetchPrices().then(setPrices);
  }, []);

  if (!user) return null;

  function formatNum(n){
    if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, {maximumFractionDigits: 2});
    return Number(n.toFixed(6)).toString().replace(/\.?0+$/, '');
  }

  // Calculate total portfolio value
  const totalValue = (ASSETS || []).reduce((sum, a) => sum + (user.portfolio[a.symbol] || 0) * prices[a.symbol], 0);

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
    <section id="profile" className="container section">
      <div className="profile-header">
        <div>
          <h2 id="profile-name">Welcome, {user.name}</h2>
          <p id="profile-email" className="muted">{user.email}</p>
        </div>
      </div>

      <div className="grid profile-grid" style={{gridTemplateColumns: "1fr 380px"}}>
        <div className="card">
          <h4>Portfolio</h4>
          <div className="portfolio-stats">
            <div>
              <div className="muted">Total Value</div>
              <div id="total-value" className="large-value">${formatNum(totalValue)}</div>
            </div>
          </div>
          <table style={{width:"100%"}}>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Holdings</th>
                <th>Value (USD)</th>
              </tr>
            </thead>
            <tbody>
              {ASSETS.map(a => (
                <tr key={a.symbol}>
                  <td>{a.symbol}</td>
                  <td>{formatNum(user.portfolio[a.symbol] || 0)}</td>
                  <td>${formatNum((user.portfolio[a.symbol] || 0) * prices[a.symbol])}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="transactions">
            <h5>Transaction History</h5>
            <ul id="tx-list" className="tx-list">
              {(!user.transactions || user.transactions.length === 0) && <li className="muted">No transactions yet</li>}
              {user.transactions && user.transactions.slice().reverse().map(tx => (
                <li key={tx.id} className="tx-item">
                  <div><strong>{tx.type}</strong> • {tx.asset}</div>
                  <div>{tx.amount_display}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card">
          <h4>Buy Crypto</h4>
          <form onSubmit={onBuy}>
            <label>Asset</label>
            <select value={asset} onChange={e => setAsset(e.target.value)}>
              {ASSETS.map(a => (
                <option key={a.symbol} value={a.symbol}>{a.label}</option>
              ))}
            </select>
            <label>Amount (USD)</label>
            <input
              type="number"
              min="1"
              step="any"
              placeholder="e.g., 50"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <div className="muted small">
              Price: <span id="form-price">${prices[asset]?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <button type="submit" className="primary">Buy {asset}</button>
          </form>
        </div>
      </div>
    </section>
  );
}