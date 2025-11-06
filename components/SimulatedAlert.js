import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const SIM_COUNTRIES = [
  "Japan", "Canada", "Nigeria", "USA", "Brazil", "Germany", "India", "South Africa", "Italy", "France", "Russia", "Australia", "Mexico", "Turkey", "China", "UK"
];
const SIM_COINS = ["BTC","ETH","USDT","SOL"];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSimData(type = "deposit") {
  const country = pickRandom(SIM_COUNTRIES);
  const coin = pickRandom(SIM_COINS);
  let amount;
  if (coin === "BTC") amount = (Math.random() * 10 + 1).toFixed(2);
  else if (coin === "ETH") amount = (Math.random() * 100 + 1).toFixed(2);
  else if (coin === "USDT") amount = (Math.random() * 10000 + 100).toFixed(0);
  else amount = (Math.random() * 5000 + 50).toFixed(0);

  return { type, country, coin, amount };
}

/**
 * SimulatedAlert
 * - Shows periodic simulated toasts like "Someone from X just deposited Y COIN".
 * - Localization-ready: uses i18n keys with interpolation.
 * - Hydration-safe: only calls t(...) after mount.
 */
export default function SimulatedAlert({ showToast }) {
  const { t, i18n } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!showToast) return;

    const interval = setInterval(() => {
      const kind = Math.random() > 0.5 ? "deposit" : "withdraw";
      const data = getRandomSimData(kind);

      // Construct localized message (uses interpolation). Use English fallback when i18n not mounted.
      const defaultDeposit = `Someone from ${data.country} just deposited ${data.amount} ${data.coin}`;
      const defaultWithdraw = `Someone in ${data.country} just withdrew ${data.amount} ${data.coin}`;

      const message = isMounted
        ? t(kind === "deposit" ? "sim.deposit" : "sim.withdraw", {
            country: data.country,
            amount: data.amount,
            coin: data.coin,
            defaultValue: kind === "deposit" ? defaultDeposit : defaultWithdraw
          })
        : (kind === "deposit" ? defaultDeposit : defaultWithdraw);

      const toastType = kind === "deposit" ? "info" : "warning";
      showToast && showToast(toastType, message, 4000);
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, [showToast, isMounted, t]);

  return null;
}