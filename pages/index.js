
import { useEffect, useState } from "react";
import BuyForm from "../components/BuyForm";
import ReviewsCarousel from "../components/ReviewsCarousel";
import { useUser } from "../context/UserContext";
import { fetchPrices } from "../lib/prices";
export default function Home({ showToast }) {
  // State for live crypto prices
  const [prices, setPrices] = useState({
    BTC: 30000,
    ETH: 2000,
    SOL: 30,
    USDT: 1,
  });
  const { user } = useUser();

  // Fetch live prices on mount
  useEffect(() => {
    fetchPrices().then(setPrices);
  }, []);

  return (
    <>
      <section id="landing" className="hero container">
        <div className="hero-left">
          <h2>Invest in Crypto the simple way</h2>
          <p>
            Automate purchases, track your portfolio, and join investors who trust BitBuy to make crypto investing approachable.
          </p>
          <div className="cta-row">
            <a href="#register">
              <button className="primary large">Get Started</button>
            </a>
            <a href="#features" className="ghost">How it works</a>
          </div>
          <ul className="highlights">
            <li>Easy setup — minutes to get started</li>
            <li>Demo portfolio and buy flow</li>
            
            <li>Secure by design (demo only)</li>
          </ul>
        </div>

        <div className="hero-right">
          <div className="card price-card">
            <div><strong>Live Crypto Prices (USD)</strong></div>
            <table>
              <tbody>
                <tr>
                  <td>BTC</td>
                  <td>${prices.BTC.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td>ETH</td>
                  <td>${prices.ETH.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td>SOL</td>
                  <td>${prices.SOL.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td>USDT</td>
                  <td>${prices.USDT.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
            <p className="muted">Live price via CoinGecko</p>
            <div className="reviews-inline">
              ⭐️⭐️⭐️⭐️⭐️ <span className="muted">4.9 (demo)</span>
            </div>
          </div>

          <div className="card features-card">
            <h4>Cool features</h4>
            <ul>
              <li>One-click investments</li>
              <li>Portfolio snapshot & history</li>
              <li>Investor testimonials</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="features" className="container section">
        <h3>Features</h3>
        <div className="grid">
          <div className="feature">
            <h4>Simple Onboarding</h4>
            <p>Register in moments and start experimenting with simulated investments.</p>
          </div>
          <div className="feature">
            <h4>Simulated Trading</h4>
            <p>Buy BTC, ETH, SOL, or USDT at the current market price for demo portfolios.</p>
          </div>
          <div className="feature">
            <h4>Portfolio Insights</h4>
            <p>See holdings, unrealized value, and transaction history.</p>
          </div>
        </div>
      </section>

      <section id="reviews" className="container section">
        <h3>What our investors say</h3>
        <ReviewsCarousel />
      </section>

      <section id="demo-buy" className="container section">
        <h3>Quick demo buy (try after registering)</h3>
        <div className="card">
          <BuyForm prices={prices} showToast={showToast} />
        </div>
      </section>
    </>
  );
}