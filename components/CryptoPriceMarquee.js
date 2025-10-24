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
    <div className="crypto-marquee-outer">
      <div className="crypto-marquee-inner">
        {COINS.map(c => (
          <span className="crypto-marquee-coin" key={c.id}>
            <span className="crypto-marquee-symbol">{c.symbol}</span>
            <span className="crypto-marquee-divider">⟡</span>
            <span className="crypto-marquee-price">
              {prices[c.id]?.usd
                ? `$${prices[c.id].usd.toLocaleString()}`
                : <span className="crypto-loading">⏳</span>}
            </span>
          </span>
        ))}
      </div>
      <style jsx>{`
        .crypto-marquee-outer {
          overflow: hidden;
          width: 100%;
          background: linear-gradient(90deg, #10141a 0%, #18212c 100%);
          border-bottom: 2px solid #1bc6ff;
          color: #fff;
          box-shadow: 0 0 24px 0 #1bc6ff33;
          position: relative;
          z-index: 1;
        }
        .crypto-marquee-inner {
          display: inline-block;
          white-space: nowrap;
          min-width: 100%;
          animation: sci-fi-marquee 20s linear infinite;
          font-family: 'Orbitron', 'Montserrat', 'Segoe UI', Arial, sans-serif;
          letter-spacing: 2px;
          background: linear-gradient(90deg, #1bc6ff33 0%, #18212c00 100%);
          padding: 0.8rem 0;
        }
        .crypto-marquee-coin {
          display: inline-flex;
          align-items: center;
          margin: 0 50px;
          font-size: 1.18rem;
          font-weight: 700;
          background: rgba(30,45,90,0.18);
          border-radius: 10px;
          box-shadow: 0 0 8px 0 #1bc6ff22;
          padding: 6px 24px 6px 16px;
          position: relative;
          transition: box-shadow 0.2s;
        }
        .crypto-marquee-coin:hover {
          box-shadow: 0 0 16px 2px #1bc6ff77;
        }
        .crypto-marquee-symbol {
          color: #1bc6ff;
          text-shadow: 0 0 8px #1bc6ffcc, 0 0 2px #fff;
          font-size: 1.3rem;
        }
        .crypto-marquee-divider {
          color: #6fffd7;
          margin: 0 12px 0 16px;
          font-size: 1.2rem;
          opacity: 0.8;
        }
        .crypto-marquee-price {
          color: #fff;
          background: linear-gradient(90deg,#ffc107 10%,#ff3cac 80%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.18rem;
          text-shadow: 0 0 4px #ffc10788, 0 0 1px #fff;
          letter-spacing: 1.5px;
        }
        .crypto-loading {
          color: #6fffd7;
          font-size: 1.2rem;
          animation: blink 1.3s infinite;
        }
        @keyframes sci-fi-marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }
        @media (max-width: 650px) {
          .crypto-marquee-inner {
            padding: 0.45rem 0;
            font-size: 1.05rem;
          }
          .crypto-marquee-coin {
            margin: 0 20px;
            padding: 4px 10px 4px 9px;
            font-size: 1rem;
          }
        }
      `}</style>
      {/* Orbitron font for sci-fi look */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700&display=swap"
        rel="stylesheet"
      />
    </div>
  );
}