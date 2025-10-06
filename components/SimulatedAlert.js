import { useEffect } from "react";

const SIM_COUNTRIES = [
  "Japan", "Canada", "Nigeria", "USA", "Brazil", "Germany", "India", "South Africa", "Italy", "France", "Russia", "Australia", "Mexico", "Turkey", "China", "UK"
];
const SIM_COINS = ["BTC","ETH","USDT","SOL"];

function getRandomSimAlert(type = "deposit") {
  const country = SIM_COUNTRIES[Math.floor(Math.random() * SIM_COUNTRIES.length)];
  const coin = SIM_COINS[Math.floor(Math.random() * SIM_COINS.length)];
  let amount;
  if (coin === "BTC") amount = (Math.random()*10+1).toFixed(2);
  else if (coin === "ETH") amount = (Math.random()*100+1).toFixed(2);
  else if (coin === "USDT") amount = (Math.random()*10000+100).toFixed(0);
  else amount = (Math.random()*5000+50).toFixed(0);

  if (type === "deposit") {
    return `Someone from ${country} just deposited ${amount} ${coin}`;
  } else {
    return `Someone in ${country} just withdrew ${amount} ${coin}`;
  }
}

export default function SimulatedAlert({ showToast }) {
  useEffect(() => {
    const alertInterval = setInterval(() => {
      if (showToast) {
        const type = Math.random() > 0.5 ? "deposit" : "withdraw";
        const msg = getRandomSimAlert(type);
        showToast(type === "deposit" ? "info" : "warning", msg, 4000);
      }
    }, 10000); // every 10 secs
    return () => clearInterval(alertInterval);
  }, [showToast]);
  return null;
}