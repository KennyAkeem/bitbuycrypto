import { useEffect, useState, useRef } from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import CryptoPriceMarquee from "../components/CryptoPriceMarquee";
import SimulatedAlert from "../components/SimulatedAlert";
import InvestmentGrowthChart from "../components/InvestmentGrowthChart";
import { useTranslation } from "react-i18next";

function getCoinBalances(investments, withdrawals) {
  const balances = {};
  investments.forEach(inv => {
    balances[inv.coin] = (balances[inv.coin] || 0) + Number(inv.amount);
  });
  withdrawals.forEach(wd => {
    if (wd.status === "success") {
      balances[wd.coin] = (balances[wd.coin] || 0) - Number(wd.amount);
    }
  });
  return balances;
}

export default function Profile({ showToast }) {
  const { t } = useTranslation();

  const { user, updateUser, logout } = useUser();
  const router = useRouter();

  // core UI state
  const [modalOpen, setModalOpen] = useState(false);
  const [coin, setCoin] = useState("btc");
  const [network, setNetwork] = useState(""); // for usdt
  const [amount, setAmount] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawCoin, setWithdrawCoin] = useState("btc");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMsg, setWithdrawMsg] = useState("");
  const [withdrawErr, setWithdrawErr] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawNetwork, setWithdrawNetwork] = useState(""); // for usdt in withdraw
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editPic, setEditPic] = useState(user?.profilePic || "");
  const [picPreview, setPicPreview] = useState(user?.profilePic || "");
  const fileInputRef = useRef(null);
  const [refCopied, setRefCopied] = useState(false);

  // mounted used to avoid SSR/CSR i18n mismatches
  const [mounted, setMounted] = useState(false);

  // holdings & pricing state
  const [coinPrices, setCoinPrices] = useState({}); // e.g. { btc: 35000, eth: 1800, usdt: 1 }
  const [totalUSD, setTotalUSD] = useState(null);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [holdingsError, setHoldingsError] = useState("");

  // translation helper (hydration-safe)
  const tSafe = (key, fallback) => (mounted ? t(key, { defaultValue: fallback }) : fallback);

  // referralLink (client only)
  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${user?.referralCode || user?.id || user?.email}`
    : "";

  useEffect(() => {
    setMounted(true);
  }, []);

  // initial fetches & re-fetch when relevant state changes
  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.replace("/");
      return;
    }

    if (router.query.invest === "true") {
      setModalOpen(true);
      router.replace("/profile", undefined, { shallow: true });
    }

    // Fetch wallet addresses
    async function fetchAddresses() {
      try {
        const { data, error } = await supabase
          .from("wallet_addresses")
          .select("coin, network, address");
        if (!error && Array.isArray(data)) {
          setAddresses(data);
        } else {
          setAddresses([]);
        }
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
        setAddresses([]);
      }
    }
    fetchAddresses();

    // Investments (your provided investments table)
    async function fetchInvestments() {
      if (!user) return;
      try {
        const userId = user.id;
        const { data, error } = await supabase
          .from("investments")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (!error && data) setInvestments(data);
      } catch (err) {
        console.error("Failed to fetch investments:", err);
      }
    }
    fetchInvestments();

    // Withdrawals
    async function fetchWithdrawals() {
      if (!user) return;
      try {
        const userId = user.id;
        const { data, error } = await supabase
          .from("withdrawals")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (!error && data) setWithdrawals(data);
      } catch (err) {
        console.error("Failed to fetch withdrawals:", err);
      }
    }
    fetchWithdrawals();

    setEditName(user?.name || "");
    setEditPic(user?.profilePic || "");
    setPicPreview(user?.profilePic || "");
  }, [user, router, modalOpen, withdrawModalOpen]);

  // Fetch live prices from CoinGecko and compute holdings
  async function fetchPricesAndComputeTotal(balances) {
    setHoldingsLoading(true);
    setHoldingsError("");
    try {
      const coinToId = { btc: "bitcoin", eth: "ethereum", usdt: "tether" };
      const coins = Object.keys(balances).filter(c => Number(balances[c]) !== 0);
      if (coins.length === 0) {
        setCoinPrices({});
        setTotalUSD(0);
        setHoldingsLoading(false);
        return;
      }
      const ids = coins.map(c => coinToId[c]).filter(Boolean).join(",");
      if (!ids) {
        setCoinPrices({});
        setTotalUSD(null);
        setHoldingsError(tSafe("profile.prices_fetch_error", "Unable to fetch price data."));
        setHoldingsLoading(false);
        return;
      }

      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`CoinGecko responded ${res.status}`);
      const data = await res.json(); // e.g. { bitcoin: { usd: 35000 }, ethereum: { usd: 1800 } }

      const priceMap = {};
      coins.forEach(c => {
        const id = coinToId[c];
        const usd = data?.[id]?.usd;
        priceMap[c] = usd ? Number(usd) : null;
      });

      setCoinPrices(priceMap);

      let total = 0;
      coins.forEach(c => {
        const amt = Number(balances[c]) || 0;
        const price = priceMap[c] || 0;
        total += amt * price;
      });
      setTotalUSD(total);
    } catch (err) {
      console.error("Failed to fetch prices:", err);
      setCoinPrices({});
      setTotalUSD(null);
      setHoldingsError(tSafe("profile.prices_fetch_error", "Unable to fetch price data."));
    } finally {
      setHoldingsLoading(false);
    }
  }

  // Recompute holdings whenever investments or withdrawals change.
  useEffect(() => {
    const balances = getCoinBalances(investments, withdrawals);
    fetchPricesAndComputeTotal(balances);
  }, [investments, withdrawals]);

  // Debug duplicate keys in development
  useEffect(() => {
    const invKeys = (investments || []).map(i => `inv-${String(i.id)}`);
    const dupInv = invKeys.filter((k, idx) => invKeys.indexOf(k) !== idx);
    if (dupInv.length) console.warn("Duplicate investment keys:", dupInv);

    const wdKeys = (withdrawals || []).map(w => `wd-${String(w.id)}`);
    const dupWd = wdKeys.filter((k, idx) => wdKeys.indexOf(k) !== idx);
    if (dupWd.length) console.warn("Duplicate withdrawal keys:", dupWd);

    const txKeys = [
      ...((investments || []).map(i => `tx-Deposit-${String(i.id)}`)),
      ...((withdrawals || []).map(w => `tx-Withdrawal-${String(w.id)}`))
    ];
    const dupTx = txKeys.filter((k, idx) => txKeys.indexOf(k) !== idx);
    if (dupTx.length) console.warn("Duplicate transaction keys:", dupTx);
  }, [investments, withdrawals]);

  // Referral copy/share
  function handleCopyReferral() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setRefCopied(true);
    setTimeout(() => setRefCopied(false), 1500);
  }

  function handleShareReferral() {
    if (navigator.share) {
      navigator.share({
        title: tSafe("profile.share_title", "Join me on Bitbuy!"),
        text: tSafe("profile.share_text", "Sign up and earn a bonus with my referral link."),
        url: referralLink
      });
    } else {
      handleCopyReferral();
    }
  }

  // Copy address with toast
  function handleCopyAddress(address) {
    if (address) {
      navigator.clipboard.writeText(address);
      showToast && showToast("success", tSafe("profile.address_copied", "Address copied!"));
    } else {
      showToast && showToast("error", tSafe("profile.no_address", "No address to copy!"));
    }
  }

  // Invest handler
  async function handleInvest(e) {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showToast && showToast("error", tSafe("profile.invalid_amount", "Enter a valid amount!"));
      return;
    }
    const userId = user.id;
    const newInvestment = {
      user_id: userId,
      coin,
      amount: Number(amount),
      status: "pending",
      ...(coin === "usdt" ? { network } : {}),
    };

    const { error } = await supabase
      .from("investments")
      .insert([newInvestment]);

    if (error) {
      showToast && showToast("error", tSafe("profile.deposit_fail", "Failed to record investment!"));
    } else {
      showToast && showToast("success", tSafe("profile.deposit_success", "Deposit successful!"));
      const { data, error: fetchError } = await supabase
        .from("investments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!fetchError && data) setInvestments(data);
    }
    setModalOpen(false);
    setAmount("");
    setCoin("btc");
    setNetwork("");
  }

  // Withdraw submit
  async function submitWithdraw(e) {
    e.preventDefault();
    const bal = balances[withdrawCoin];
    const amtNum = Number(withdrawAmount);
    if (!amtNum || amtNum <= 0) {
      setWithdrawErr(tSafe("profile.withdraw_invalid_amount", "Enter a valid amount!"));
      return;
    }
    if (amtNum > bal) {
      setWithdrawErr(tSafe("profile.withdraw_over_balance", "Cannot withdraw more than your balance!"));
      return;
    }
    if (!withdrawAddress.trim()) {
      setWithdrawErr(tSafe("profile.withdraw_address_required", "Wallet address required!"));
      return;
    }
    const userId = user.id;
    const newWithdrawal = {
      user_id: userId,
      coin: withdrawCoin,
      amount: amtNum,
      address: withdrawAddress,
      status: "pending",
      ...(withdrawCoin === "usdt" ? { network: withdrawNetwork } : {}),
    };

    const { error } = await supabase
      .from("withdrawals")
      .insert([newWithdrawal]);
    if (error) {
      setWithdrawErr(tSafe("profile.withdraw_fail", "Failed to record withdrawal!"));
    } else {
      showToast && showToast(
        "info",
        tSafe("profile.withdraw_request_msg", "Withdrawal request for {{amount}} {{coin}} submitted. Waiting admin approval.", { amount: amtNum, coin: withdrawCoin.toUpperCase() }),
        4000
      );
      const { data, error: fetchError } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!fetchError && data) setWithdrawals(data);
      setWithdrawModalOpen(false);
      setWithdrawAmount("");
      setWithdrawCoin("btc");
      setWithdrawAddress("");
      setWithdrawErr("");
      setWithdrawNetwork("");
    }
  }

  // Open Withdraw modal with a default coin (first coin with funds)
  function handleWithdraw() {
    const coinsWithFunds = Object.entries(balances).filter(([c, amt]) => amt > 0);
    if (coinsWithFunds.length === 0) {
      setWithdrawMsg(tSafe("profile.withdraw_nothing", "Nothing to withdraw yet. Invest now to start earning!"));
      setWithdrawCoin("btc");
      setWithdrawAmount("");
      setWithdrawAddress("");
      setWithdrawModalOpen(true);
    } else {
      setWithdrawMsg("");
      setWithdrawCoin(coinsWithFunds[0][0]);
      setWithdrawAmount("");
      setWithdrawAddress("");
      setWithdrawErr("");
      setWithdrawModalOpen(true);
      setWithdrawNetwork("");
    }
  }

  // Edit profile save
  function handleEditProfile(e) {
    e.preventDefault();
    if (!editName.trim()) {
      showToast && showToast("error", tSafe("profile.display_name_required", "Display name required!"));
      return;
    }
    updateUser({
      ...user,
      name: editName,
      profilePic: picPreview
    });
    setEditing(false);
    showToast && showToast("success", tSafe("profile.profile_updated", "Profile updated!"));
  }

  // Picture handling
  function handlePicChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 200 * 1024) {
      showToast && showToast("error", tSafe("profile.pic_too_large", "Profile picture must be less than 200KB."));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPicPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  // Delete account (local logout only - implement backend deletion separately)
  function handleDeleteAccount() {
    const confirmMsg = tSafe("profile.confirm_delete_account", "Are you sure you want to delete your account? This cannot be undone.");
    if (window.confirm(confirmMsg)) {
      logout();
      showToast && showToast("success", tSafe("profile.account_deleted", "Account deleted!"));
      router.replace("/");
    }
  }

  // Ensure we wait for client mount to avoid SSR/CSR mismatch
  if (!mounted) return <div>{tSafe("profile.loading", "Loading...")}</div>;
  if (user === undefined) return <div>{tSafe("profile.loading", "Loading...")}</div>;
  if (!user) return <div>{tSafe("profile.not_authorized", "Not authorized")}</div>;

  // compute balances for rendering
  const balances = getCoinBalances(investments, withdrawals);

  // Find address for coin/network
  function getAddress(coin, network = null) {
    if (coin === "btc") {
      const btcRow = addresses.find(a => a.coin === "btc");
      return btcRow?.address || "";
    }
    if (coin === "eth") {
      const ethRow = addresses.find(a => a.coin === "eth" && a.network === "ERC20");
      return ethRow?.address || "";
    }
    if (coin === "usdt") {
      const usdtRow = addresses.find(a => a.coin === "usdt" && a.network === network);
      return usdtRow?.address || "";
    }
    return "";
  }

  // Manual refresh handler: refetch investments/withdrawals and prices
  async function handleRefreshHoldings() {
    if (!user) return;
    setHoldingsLoading(true);
    try {
      const userId = user.id;
      const [{ data: invData, error: invErr }, { data: wdData, error: wdErr }] = await Promise.all([
        supabase.from("investments").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("withdrawals").select("*").eq("user_id", userId).order("created_at", { ascending: false })
      ]);
      if (!invErr && Array.isArray(invData)) setInvestments(invData);
      if (!wdErr && Array.isArray(wdData)) setWithdrawals(wdData);
      const newBalances = getCoinBalances(invData || investments, wdData || withdrawals);
      await fetchPricesAndComputeTotal(newBalances);
      showToast && showToast("info", tSafe("profile.refreshing", "Refreshing holdings..."));
    } catch (err) {
      console.error("Refresh failed", err);
      setHoldingsError(tSafe("profile.refresh_failed", "Failed to refresh holdings."));
    } finally {
      setHoldingsLoading(false);
    }
  }

  // coins to display in holdings (keeps consistent order)
  const displayCoins = ["btc", "eth", "usdt"];

  return (
    <div className="container py-4">
      <style>{`
        @keyframes pulse-badge {
          0% { box-shadow: 0 0 0 0 rgba(25, 199, 84, 0.5); }
          70% { box-shadow: 0 0 0 10px rgba(25, 199, 84, 0); }
          100% { box-shadow: 0 0 0 0 rgba(25, 199, 84, 0); }
        }
        .pulsing-badge {
          animation: pulse-badge 1.2s infinite;
        }
        .badge-erc20 {
          background-color: #6f42c1 !important;
        }
        .badge-bep20 {
          background-color: #198754 !important;
        }
        .badge-trc20 {
          background-color: #ff9800 !important;
        }
        /* Responsive tweaks for holdings card */
        .holdings-coin {
          min-width: 0; /* allow text truncation */
        }
        .holdings-coin .fw-bold {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      `}</style>

      <CryptoPriceMarquee />
      <SimulatedAlert showToast={showToast} />

      {/* User info */}
      <div className="row mb-4">
        <div className="col-md-8 mx-auto text-center">
          <div className="d-flex flex-column align-items-center">
            <img
              src={user.profilePic || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "U") + "&background=random"}
              alt={tSafe("profile.profile_alt", "profile")}
              className="rounded-circle mb-2"
              style={{ width: 80, height: 80, objectFit: "cover", border: "2px solid #1bc6ff" }}
            />
            <h2 className="fw-bold mb-2">{user.name}</h2>
            <p className="text-muted">{tSafe("profile.email_label", "Email")}: {user.email}</p>
            <button className="btn btn-outline-primary btn-sm mt-2" onClick={() => setEditing(true)}>
              {tSafe("profile.edit_profile_button", "Edit Profile")}
            </button>
          </div>
        </div>
      </div>

      {/* Total Assets / Holdings Section (responsive + translatable) */}
      <div className="row mb-4">
        <div className="col-12 col-md-10 mx-auto">
          <div className="card shadow-sm rounded-3 p-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div className="flex-grow-1">
                <h5 className="mb-0 fw-bold">{tSafe("profile.total_assets_title", "Total Assets")}</h5>
                <small className="text-muted">{tSafe("profile.total_assets_sub", "Summary of your current holdings")}</small>
              </div>

              <div className="text-end">
                {holdingsLoading ? (
                  <div className="text-muted">{tSafe("profile.calculating", "Calculating...")}</div>
                ) : totalUSD === null ? (
                  <div>
                    <div className="fw-bold">{tSafe("profile.prices_unavailable", "Prices unavailable")}</div>
                    <small className="text-muted">{tSafe("profile.native_balance_display", "Showing balances in coin units")}</small>
                  </div>
                ) : (
                  <div>
                    <div className="fs-5 fw-bold">${Number(totalUSD).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <small className="text-muted">{tSafe("profile.total_value_usd", "Total value (USD)")}</small>
                  </div>
                )}
              </div>
            </div>

            <div className="row mt-3 gy-2">
              {displayCoins.map(c => {
                const amt = Number(balances[c]) || 0;
                const price = coinPrices[c] ?? null;
                return (
                  <div key={c} className="col-12 col-sm-6 col-md-4">
                    <div className="d-flex align-items-center gap-3 holdings-coin">
                      <img
                        src={
                          c === "btc" ? "/images/bitcoin.png" :
                          c === "eth" ? "/images/ethereum.png" :
                          "/images/tether.png"
                        }
                        alt={c}
                        style={{ width: 40, height: 40, objectFit: "cover", borderRadius: "50%" }}
                      />
                      <div className="w-100">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="fw-bold text-uppercase">{c}</div>
                          <div className="text-end">
                            <div className="small text-muted">{tSafe("profile.balance_label", "Balance")}</div>
                            <div className="fw-semibold">{amt}</div>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-1 small text-muted">
                          <div>
                            {price !== null ? (
                              <span>{tSafe("profile.price_label", "Price")}: ${Number(price).toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
                            ) : (
                              <span>{tSafe("profile.price_unavailable_short", "No price")}</span>
                            )}
                          </div>
                          <div>
                            {price !== null ? (
                              <span>~${(amt * price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {holdingsError && <div className="text-danger small mt-2">{holdingsError}</div>}

            <div className="d-flex justify-content-end mt-3">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={handleRefreshHoldings}
                aria-label={tSafe("profile.refresh_holdings", "Refresh holdings")}
              >
                {tSafe("profile.refresh_holdings", "Refresh")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How to Get Started Section (Responsive Final Version) */}
      <div className="container my-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="card border-warning shadow-sm rounded-3 p-3 p-md-4 text-center">
              {/* Icon */}
              <div className="d-flex justify-content-center align-items-center mb-3">
                <div
                  className="rounded-circle d-flex justify-content-center align-items-center"
                  style={{
                    width: "70px",
                    height: "70px",
                    backgroundColor: "#fff8e1",
                    border: "2px solid #ffcc00",
                  }}
                >
                  <i
                    className="bi bi-currency-dollar text-warning"
                    style={{ fontSize: "2rem" }}
                    aria-hidden
                  ></i>
                </div>
              </div>

              {/* Title */}
              <h5 className="fw-bold text-dark mb-3">
                {tSafe("profile.quick_guide_title", "Quick Guide")}&nbsp;
                <span className="badge bg-light text-warning border border-warning ms-1">
                  {tSafe("profile.quick_guide_badge", "Read Carefully")}
                </span>
              </h5>

              {/* Steps */}
              <div
                className="bg-light p-3 p-md-4 rounded-3 mx-auto text-start"
                style={{ maxWidth: "600px" }}
              >
                <h6 className="fw-bold mb-3 text-center">{tSafe("profile.how_to_get_started_heading", "How to get started:")}</h6>
                <ol className="text-muted small mb-0 ps-3">
                  <li>
                    {tSafe("profile.step_1_prefix", "Click")} <strong onClick={() => setModalOpen(true)}>{tSafe("profile.invest_now", '"Invest Now"')}</strong>.
                  </li>
                  <li>
                    {tSafe("profile.step_2", "Select your preferred cryptocurrency and network (if applicable).")}
                  </li>
                  <li>{tSafe("profile.step_3", "Copy the deposit address.")}</li>
                  <li>{tSafe("profile.step_4", "Send cryptocurrency to the provided (copied) address.")}</li>
                  <li>{tSafe("profile.step_5", "Confirm your payment.")}</li>
                  <li>{tSafe("profile.step_6", "Wait for admin confirmation.")}</li>
                  <li>{tSafe("profile.step_7", "Your investment starts yielding interests immediately your deposit is confirmed.")}</li>
                  <li>{tSafe("profile.step_8", "Monitor your investment growth in the dashboard.")}</li>
                  <li>{tSafe("profile.step_9", "Withdraw your earnings anytime!")}</li>
                </ol>
              </div>

              {/* Button (optional) */}
              <div className="d-flex justify-content-center mt-4">
                <button className="btn btn-warning fw-semibold px-4" onClick={() => setModalOpen(true)}>
                  {tSafe("profile.invest_now_cta", "Invest Now")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="modal fade show" style={{ display: "block", background: "#0007" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleEditProfile}>
                <div className="modal-header">
                  <h5 className="modal-title">{tSafe("profile.edit_profile_modal_title", "Edit Profile")}</h5>
                  <button type="button" className="btn-close" aria-label={tSafe("profile.close", "Close")} onClick={() => setEditing(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3 text-center">
                    <img
                      src={picPreview || "https://ui-avatars.com/api/?name=" + encodeURIComponent(editName || "U") + "&background=random"}
                      alt={tSafe("profile.preview_alt", "preview")}
                      className="rounded-circle mb-2"
                      style={{ width: 80, height: 80, objectFit: "cover", border: "2px solid #1bc6ff" }}
                    />
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handlePicChange}
                        aria-label={tSafe("profile.change_picture_input", "Change picture input")}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {tSafe("profile.change_picture", "Change Picture")}
                      </button>
                      {picPreview && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger ms-2"
                          onClick={() => setPicPreview("")}
                        >
                          {tSafe("profile.remove_picture", "Remove")}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">{tSafe("profile.display_name_label", "Display Name")}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer d-flex justify-content-between">
                  <button type="submit" className="btn btn-primary">{tSafe("profile.save", "Save")}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
                    {tSafe("profile.cancel", "Cancel")}
                  </button>
                  <button type="button" className="btn btn-danger" onClick={handleDeleteAccount}>
                    {tSafe("profile.delete_account", "Delete Account")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Investments Table */}
      <div className="row mb-4">
        <div className="col-md-10 mx-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>{tSafe("profile.your_investments", "Your Investments")}</h4>
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
              {tSafe("profile.add_funds", "Add Funds")}
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-secondary">
                <tr>
                  <th>{tSafe("profile.col_coin", "Coin")}</th>
                  <th>{tSafe("profile.col_amount", "Amount")}</th>
                  <th>{tSafe("profile.col_status", "Status")}</th>
                  <th>{tSafe("profile.col_time", "Time")}</th>
                </tr>
              </thead>
              <tbody>
                {investments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted">
                      {tSafe("profile.no_investments", "No investments yet.")}
                    </td>
                  </tr>
                ) : (
                  investments.map(inv => {
                    const key = `inv-${inv.id}`;
                    const status = inv.status || "pending";

                    const coinImages = {
                      btc: "/images/bitcoin.png",
                      eth: "/images/ethereum.png",
                      usdt: "/images/tether.png",
                    };

                    return (
                      <tr key={key}>
                        <td className="fw-bold text-uppercase d-flex align-items-center">
                          <img
                            src={coinImages[inv.coin.toLowerCase()]}
                            alt={inv.coin}
                            className="me-2"
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                          {inv.coin}
                          {inv.coin === "eth" && (
                            <span className="badge badge-erc20 ms-2">{tSafe("profile.badge_erc20", "ERC20")}</span>
                          )}
                          {inv.coin === "usdt" && inv.network && (
                            <span
                              className={`badge ${
                                inv.network === "BEP20"
                                  ? "badge-bep20"
                                  : "badge-trc20"
                              } ms-2`}
                            >
                              {inv.network}
                            </span>
                          )}
                        </td>
                        <td>{inv.amount}</td>
                        <td>
                          <span
                            className={`badge bg-${
                              status === "pending" ? "warning" : "success"
                            } text-dark`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td>
                          {inv.created_at
                            ? new Date(inv.created_at).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Withdraw Button */}
      <div className="row mb-4">
        <div className="col-md-10 mx-auto text-end">
          <button className="btn btn-warning mt-3" onClick={handleWithdraw}>
            {tSafe("profile.withdraw_funds", "Withdraw Funds")}
          </button>
        </div>
      </div>

      <InvestmentGrowthChart investments={investments.filter(inv => inv.status === "success")} />

      {/* Transaction History */}
      <div className="row mb-4">
        <div className="col-md-10 mx-auto">
          <h4>{tSafe("profile.transaction_history", "Transaction History")}</h4>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-secondary">
                <tr>
                  <th>{tSafe("profile.col_type", "Type")}</th>
                  <th>{tSafe("profile.col_coin", "Coin")}</th>
                  <th>{tSafe("profile.col_amount", "Amount")}</th>
                  <th>{tSafe("profile.col_status", "Status")}</th>
                  <th>{tSafe("profile.col_time", "Time")}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ...investments.map(inv => ({ ...inv, type: "Deposit" })),
                  ...withdrawals.map(wd => ({ ...wd, type: "Withdrawal" })),
                ]
                  .sort(
                    (a, b) =>
                      new Date(b.created_at || b.timestamp) -
                      new Date(a.created_at || a.timestamp)
                  )
                  .map(tx => {
                    const key = `tx-${tx.type}-${tx.id}`;
                    const status = tx.status || "pending";

                    const coinImages = {
                      btc: "/images/bitcoin.png",
                      eth: "/images/ethereum.png",
                      usdt: "/images/tether.png",
                    };

                    return (
                      <tr key={key}>
                        <td>{tx.type}</td>
                        <td className="fw-bold text-uppercase d-flex align-items-center">
                          <img
                            src={coinImages[tx.coin.toLowerCase()]}
                            alt={tx.coin}
                            className="me-2"
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                          {tx.coin}
                          {tx.coin === "eth" && (
                            <span className="badge badge-erc20 ms-2">{tSafe("profile.badge_erc20", "ERC20")}</span>
                          )}
                          {tx.coin === "usdt" && tx.network && (
                            <span
                              className={`badge ${
                                tx.network === "BEP20"
                                  ? "badge-bep20"
                                  : "badge-trc20"
                              } ms-2`}
                            >
                              {tx.network}
                            </span>
                          )}
                        </td>
                        <td>{tx.amount}</td>
                        <td>
                          <span
                            className={`badge bg-${
                              status === "pending" ? "warning" : "success"
                            } text-dark`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td>
                          {tx.created_at
                            ? new Date(tx.created_at).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      {modalOpen && (
        <div className="modal fade show" style={{ display: "block", background: "#0004" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleInvest}>
                <div className="modal-header">
                  <h5 className="modal-title">{tSafe("profile.new_investment", "New Investment")}</h5>
                  <button type="button" className="btn-close" aria-label={tSafe("profile.close", "Close")} onClick={() => setModalOpen(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">{tSafe("profile.select_coin", "Select Coin")}</label>
                    <div className="d-flex gap-3">
                      {["btc", "eth", "usdt"].map(c => (
                        <div key={c} style={{ position: "relative" }}>
                          {c === "usdt" && (
                            <>
                              <span
                                className="pulsing-badge badge-trc20"
                                style={{
                                  position: "absolute",
                                  top: "-18px",
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  color: "white",
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                  padding: "2px 8px",
                                  borderRadius: "7px",
                                  whiteSpace: "nowrap",
                                  zIndex: 2,
                                }}
                              >
                                {tSafe("profile.network_label", "Network!")}
                              </span>
                            </>
                          )}
                          {c === "eth" && (
                            <span
                              className="pulsing-badge badge-erc20"
                              style={{
                                position: "absolute",
                                top: "-18px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                color: "white",
                                fontSize: "11px",
                                fontWeight: "bold",
                                padding: "2px 8px",
                                borderRadius: "7px",
                                whiteSpace: "nowrap",
                                zIndex: 2,
                              }}
                            >
                              {tSafe("profile.badge_erc20", "ERC20")}
                            </span>
                          )}
                          <button
                            type="button"
                            className={`btn btn-outline-${coin === c ? "primary" : "secondary"}`}
                            onClick={() => { setCoin(c); if(c !== "usdt"){ setNetwork(""); } }}
                            style={{ position: "relative", zIndex: 1 }}
                          >
                            {c.toUpperCase()}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* If USDT, let user pick network */}
                  {coin === "usdt" && (
                    <div className="mb-3">
                      <label className="form-label fw-bold">{tSafe("profile.select_usdt_network", "Select USDT Network")}</label>
                      <div className="d-flex gap-3">
                        {["BEP20", "TRC20"].map(net => (
                          <button
                            key={net}
                            type="button"
                            className={`btn btn-outline-${network === net ? "primary" : "secondary"}`}
                            onClick={() => setNetwork(net)}
                          >
                            {net}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-bold">{tSafe("profile.deposit_address", "Deposit Address")}</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={
                          coin === "btc" ? getAddress("btc") :
                          coin === "eth" ? getAddress("eth", "ERC20") :
                          coin === "usdt" && network ? getAddress("usdt", network) : ""
                        }
                        readOnly
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => handleCopyAddress(
                          coin === "btc" ? getAddress("btc") :
                          coin === "eth" ? getAddress("eth", "ERC20") :
                          coin === "usdt" && network ? getAddress("usdt", network) : ""
                        )}
                      >
                        {tSafe("profile.copy", "Copy")}
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">{tSafe("profile.amount_label", "Amount")}</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      step="any"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">{tSafe("profile.pay_now", "Pay Now")}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>{tSafe("profile.cancel", "Cancel")}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {withdrawModalOpen && (
        <div className="modal fade show" style={{ display: "block", background: "#0004" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={withdrawMsg ? undefined : submitWithdraw}>
                <div className="modal-header">
                  <h5 className="modal-title">{tSafe("profile.withdrawal", "Withdrawal")}</h5>
                  <button type="button" className="btn-close" aria-label={tSafe("profile.close", "Close")} onClick={() => {
                    setWithdrawModalOpen(false);
                    setWithdrawAddress("");
                    setWithdrawNetwork("");
                  }}></button>
                </div>
                <div className="modal-body">
                  {withdrawMsg ? (
                    <p>{withdrawMsg}</p>
                  ) : (
                    <>
                      <div className="mb-3">
                        <label className="form-label fw-bold">{tSafe("profile.select_coin", "Select Coin")}</label>
                        <select
                          className="form-select"
                          value={withdrawCoin}
                          onChange={e => {
                            setWithdrawCoin(e.target.value);
                            setWithdrawErr("");
                            setWithdrawNetwork("");
                          }}
                        >
                          {["btc", "eth", "usdt"].map(c => (
                            <option key={c} value={c}>{c.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>

                      {/* If USDT, pick network */}
                      {withdrawCoin === "usdt" && (
                        <div className="mb-3">
                          <label className="form-label fw-bold">{tSafe("profile.select_usdt_network", "Select USDT Network")}</label>
                          <select
                            className="form-select"
                            value={withdrawNetwork}
                            onChange={e => setWithdrawNetwork(e.target.value)}
                            required
                          >
                            <option value="">{tSafe("profile.select_network_placeholder", "Select Network")}</option>
                            <option value="BEP20">BEP20</option>
                            <option value="TRC20">TRC20</option>
                          </select>
                        </div>
                      )}

                      <div className="mb-3">
                        <label className="form-label fw-bold">{tSafe("profile.withdrawal_amount", "Withdrawal Amount")}</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          step="any"
                          value={withdrawAmount}
                          onChange={e => {
                            setWithdrawAmount(e.target.value);
                            setWithdrawErr("");
                          }}
                          required
                        />
                        {withdrawErr && <div className="text-danger mt-2">{withdrawErr}</div>}
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-bold">{tSafe("profile.wallet_address", "Wallet Address")}</label>
                        <input
                          type="text"
                          className="form-control"
                          value={withdrawAddress}
                          onChange={e => setWithdrawAddress(e.target.value)}
                          placeholder={tSafe("profile.wallet_placeholder", "Enter your wallet address")}
                          required
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  {withdrawMsg ? (
                    <button type="button" className="btn btn-primary" onClick={() => {
                      setWithdrawModalOpen(false);
                      setWithdrawAddress("");
                      setWithdrawNetwork("");
                    }}>
                      {tSafe("profile.close", "Close")}
                    </button>
                  ) : (
                    <>
                      <button type="submit" className="btn btn-warning">{tSafe("profile.withdraw_button", "Withdraw")}</button>
                      <button type="button" className="btn btn-secondary" onClick={() => {
                        setWithdrawModalOpen(false);
                        setWithdrawAddress("");
                        setWithdrawNetwork("");
                      }}>
                        {tSafe("profile.cancel", "Cancel")}
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}