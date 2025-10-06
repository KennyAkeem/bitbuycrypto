import { useEffect, useState } from "react";

const COINS = [
  { id: "bitcoin", symbol: "BTC" },
  { id: "ethereum", symbol: "ETH" },
  { id: "solana", symbol: "SOL" },
  { id: "tether", symbol: "USDT" },
];

export default function CryptoPriceMarquee() {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    async function fetchPrices() {
      try {
        const ids = COINS.map(c => c.id).join(",");
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
        const res = await fetch(url);
        const data = await res.json();
        setPrices(data);
      } catch (err) {
        setPrices({});
      }
    }
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      overflow: "hidden",
      width: "100%",
      background: "#111",
      borderBottom: "2px solid #1bc6ff",
      color: "#fff"
    }}>
      <div style={{
        display: "inline-block",
        whiteSpace: "nowrap",
        minWidth: "100%",
        animation: "marquee 24s linear infinite"
      }}>
        {COINS.map(c => (
          <span key={c.id} style={{
            display: "inline-block",
            margin: "0 40px",
            fontWeight: "bold",
            fontSize: "1.12rem",
            letterSpacing: 1
          }}>
            <span style={{ color: "#1bc6ff" }}>{c.symbol}</span>:&nbsp;
            <span style={{ color: "#ffc107" }}>
              {prices[c.id]?.usd
                ? `$${prices[c.id].usd.toLocaleString()}`
                : "..."}
            </span>
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}