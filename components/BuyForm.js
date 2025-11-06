import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useTranslation } from "react-i18next";

const ASSETS = [
  { symbol: "BTC", labelKey: "asset.BTC", fallback: "Bitcoin" },
  { symbol: "ETH", labelKey: "asset.ETH", fallback: "Ethereum" },
  { symbol: "SOL", labelKey: "asset.SOL", fallback: "Solana" },
  { symbol: "USDT", labelKey: "asset.USDT", fallback: "Tether (USDT)" }
];

export default function BuyForm({ prices = {}, showToast }) {
  const { user, updateUser } = useUser();
  const { t, i18n } = useTranslation();

  // hydration-safe rendering: only use t(...) after client mount
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const tSafe = (key, fallback) => (isMounted ? (t(key) || fallback) : fallback);

  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState("BTC");

  if (!user) {
    return <div className="muted">{tSafe("buy.login_prompt", "Please login to buy (demo)")}</div>;
  }

  function formatNum(n) {
    if (!Number.isFinite(n)) return "0";
    if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return Number(n.toFixed(6)).toString().replace(/\.?0+$/, "");
  }

  function onBuy(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      showToast && showToast("error", isMounted ? t("buy.enter_positive_amount", "Enter a positive USD amount") : "Enter a positive USD amount");
      return;
    }
    const price = prices[asset] || 0;
    const acquired = price > 0 ? amt / price : 0;
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

    // success message with interpolation (use i18n when mounted)
    if (isMounted) {
      showToast && showToast("success", t("buy.bought_msg", { amount: formatNum(acquired), asset, amt: formatNum(amt) }, { defaultValue: `Bought ${formatNum(acquired)} ${asset} for $${formatNum(amt)} (demo)` }));
    } else {
      showToast && showToast("success", `Bought ${formatNum(acquired)} ${asset} for $${formatNum(amt)} (demo)`);
    }
  }

  return (
    <div>
      <h4>{tSafe("buy.title", "Buy Crypto")}</h4>

      <form onSubmit={onBuy} id="buy-form">
        <label>{tSafe("buy.asset_label", "Asset")}</label>
        <select
          value={asset}
          onChange={(e) => setAsset(e.target.value)}
          aria-label={tSafe("buy.asset_label", "Asset")}
        >
          {ASSETS.map((a) => (
            <option key={a.symbol} value={a.symbol}>
              {isMounted ? (t(a.labelKey) || a.fallback) : a.fallback}
            </option>
          ))}
        </select>

        <label>{tSafe("buy.amount_label", "Amount (USD)")}</label>
        <input
          type="number"
          min="1"
          step="any"
          placeholder={tSafe("buy.amount_placeholder", "e.g., 50")}
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          aria-label={tSafe("buy.amount_label", "Amount (USD)")}
        />

        <div className="muted small" style={{ marginTop: 6 }}>
          {tSafe("buy.price_prefix", "Price")}:{" "}
          <span id="form-price">
            ${formatNum(prices[asset] || 0)}
          </span>
        </div>

        <button
          type="submit"
          className="primary"
          style={{ marginTop: 10 }}
          aria-live="polite"
        >
          {isMounted ? t("buy.buy_button", { asset }, { defaultValue: `Buy ${asset}` }) : `Buy ${asset}`}
        </button>
      </form>

      <h4 style={{ marginTop: "1rem" }}>{tSafe("buy.investment_options_title", "Investment Options")}</h4>
      <div className="invest-options" style={{ display: "flex", gap: 8 }}>
        {[25, 50, 100, 250].map((a) => (
          <button key={a} className="option" onClick={() => setAmount(String(a))}>
            {isMounted ? t("buy.quick_amount", { amount: a }, { defaultValue: `$${a}` }) : `$${a}`}
          </button>
        ))}
      </div>
    </div>
  );
}