import { useEffect, useState, useRef } from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import CryptoPriceMarquee from "../components/CryptoPriceMarquee";
import SimulatedAlert from "../components/SimulatedAlert";
import InvestmentGrowthChart from "../components/InvestmentGrowthChart";

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
  const { user, updateUser, logout } = useUser();
  const router = useRouter();
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
  const [mounted, setMounted] = useState(false);

  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${user?.referralCode || user?.id || user?.email}`
    : "";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) router.replace("/");
    if (router.query.invest === "true") {
      setModalOpen(true);
      router.replace("/profile", undefined, { shallow: true });
    }
    // Fetch wallet addresses
    async function fetchAddresses() {
      const { data, error } = await supabase
        .from("wallet_addresses")
        .select("coin, network, address");
      if (!error && Array.isArray(data)) {
        setAddresses(data);
      } else {
        setAddresses([]);
      }
    }
    fetchAddresses();

    // Investments
    async function fetchInvestments() {
      if (!user) return;
      const userId = user.id;
      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) setInvestments(data);
    }
    fetchInvestments();

    // Withdrawals
    async function fetchWithdrawals() {
      if (!user) return;
      const userId = user.id;
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) setWithdrawals(data);
    }
    fetchWithdrawals();

    setEditName(user?.name || "");
    setEditPic(user?.profilePic || "");
    setPicPreview(user?.profilePic || "");
  }, [user, router, modalOpen, withdrawModalOpen]);

  // Debug duplicate keys in development (MUST be declared unconditionally, before any early returns)
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

  function handleCopyReferral() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setRefCopied(true);
    setTimeout(() => setRefCopied(false), 1500);
  }

  function handleShareReferral() {
    if (navigator.share) {
      navigator.share({
        title: "Join me on Bitbuy!",
        text: "Sign up and earn a bonus with my referral link.",
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
      showToast && showToast("success", "Address copied!");
    } else {
      showToast && showToast("error", "No address to copy!");
    }
  }

  async function handleInvest(e) {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showToast && showToast("error", "Enter a valid amount!");
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
      showToast && showToast("error", "Failed to record investment!");
    } else {
      showToast && showToast("success", "Deposit successful!");
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

  async function submitWithdraw(e) {
    e.preventDefault();
    const bal = balances[withdrawCoin];
    const amtNum = Number(withdrawAmount);
    if (!amtNum || amtNum <= 0) {
      setWithdrawErr("Enter a valid amount!");
      return;
    }
    if (amtNum > bal) {
      setWithdrawErr("Cannot withdraw more than your balance!");
      return;
    }
    if (!withdrawAddress.trim()) {
      setWithdrawErr("Wallet address required!");
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
      setWithdrawErr("Failed to record withdrawal!");
    } else {
      showToast && showToast(
        "info",
        `Withdrawal request for ${amtNum} ${withdrawCoin.toUpperCase()} submitted. Waiting admin approval.`,
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

  function handleWithdraw() {
    const coinsWithFunds = Object.entries(balances).filter(([c, amt]) => amt > 0);
    if (coinsWithFunds.length === 0) {
      setWithdrawMsg("Nothing to withdraw yet. Invest now to start earning!");
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

  function handleEditProfile(e) {
    e.preventDefault();
    if (!editName.trim()) {
      showToast && showToast("error", "Display name required!");
      return;
    }
    updateUser({
      ...user,
      name: editName,
      profilePic: picPreview
    });
    setEditing(false);
    showToast && showToast("success", "Profile updated!");
  }

  function handlePicChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 200 * 1024) {
      showToast && showToast("error", "Profile picture must be less than 200KB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPicPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleDeleteAccount() {
    if (window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      logout();
      showToast && showToast("success", "Account deleted!");
      router.replace("/");
    }
  }

  // Ensure we wait for client mount to avoid SSR/CSR mismatch
  if (!mounted) return <div>Loading...</div>;
  if (user === undefined) return <div>Loading...</div>;
  if (!user) return <div>Not authorized</div>;

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
      `}</style>
      <CryptoPriceMarquee />
      <SimulatedAlert showToast={showToast} />
      {/* User info */}
      <div className="row mb-4">
        <div className="col-md-8 mx-auto text-center">
          <div className="d-flex flex-column align-items-center">
            <img
              src={user.profilePic || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "U") + "&background=random"}
              alt="profile"
              className="rounded-circle mb-2"
              style={{ width: 80, height: 80, objectFit: "cover", border: "2px solid #1bc6ff" }}
            />
            <h2 className="fw-bold mb-2">{user.name}</h2>
            <p className="text-muted">Email: {user.email}</p>
            <button className="btn btn-outline-primary btn-sm mt-2" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          </div>
        </div>
      </div>
      {/* Referral Program Section */}
      <div className="row mb-4">
        <div className="col-md-8 mx-auto">
          <div className="card border-info mb-3">
            <div className="card-body text-center">
              <h5 className="card-title">Referral Program</h5>
              <p className="card-text">
                Share your personal link. You get <b>5 USDT</b> for every friend who joins and invests!
              </p>
              <input
                type="text"
                className="form-control text-center mb-2"
                value={referralLink}
                readOnly
                style={{ fontWeight: "bold" }}
              />
              <div className="d-flex justify-content-center gap-2">
                <button className="btn btn-primary" onClick={handleCopyReferral}>
                  {refCopied ? "Copied!" : "Copy Link"}
                </button>
                <button className="btn btn-success" onClick={handleShareReferral}>
                  Share
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
                  <h5 className="modal-title">Edit Profile</h5>
                  <button type="button" className="btn-close" onClick={() => setEditing(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3 text-center">
                    <img
                      src={picPreview || "https://ui-avatars.com/api/?name=" + encodeURIComponent(editName || "U") + "&background=random"}
                      alt="preview"
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
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change Picture
                      </button>
                      {picPreview && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger ms-2"
                          onClick={() => setPicPreview("")}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Display Name</label>
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
                  <button type="submit" className="btn btn-primary">Save</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger" onClick={handleDeleteAccount}>
                    Delete Account
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
            <h4>Your Investments</h4>
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
              Invest Now
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-secondary">
                <tr>
                  <th>Coin</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {investments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted">No investments yet.</td>
                  </tr>
                ) : (
                  investments.map(inv => {
                    const key = `inv-${inv.id}`;
                    const status = inv.status || "pending";
                    return (
                      <tr key={key}>
                        <td className="fw-bold text-uppercase">
                          {inv.coin}
                          {inv.coin === "eth" && <span className="badge badge-erc20 ms-2">ERC20</span>}
                          {inv.coin === "usdt" && inv.network && (
                            <span className={`badge ${inv.network === "BEP20" ? "badge-bep20" : "badge-trc20"} ms-2`}>
                              {inv.network}
                            </span>
                          )}
                        </td>
                        <td>{inv.amount}</td>
                        <td>
                          <span className={`badge bg-${status === "pending" ? "warning" : "success"} text-dark`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td>{inv.created_at ? new Date(inv.created_at).toLocaleString() : "-"}</td>
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
            Withdraw Funds
          </button>
        </div>
      </div>
      <InvestmentGrowthChart investments={investments.filter(inv => inv.status === "success")} />
      <div className="row mb-4">
        <div className="col-md-10 mx-auto">
          <h4>Transaction History</h4>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-secondary">
                <tr>
                  <th>Type</th>
                  <th>Coin</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ...investments.map(inv => ({ ...inv, type: "Deposit" })),
                  ...withdrawals.map(wd => ({ ...wd, type: "Withdrawal" }))
                ]
                  .sort((a, b) => new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp))
                  .map(tx => {
                    const key = `tx-${tx.type}-${tx.id}`;
                    const status = tx.status || "pending";
                    return (
                      <tr key={key}>
                        <td>{tx.type}</td>
                        <td className="fw-bold text-uppercase">
                          {tx.coin}
                          {tx.coin === "eth" && <span className="badge badge-erc20 ms-2">ERC20</span>}
                          {tx.coin === "usdt" && tx.network && (
                            <span className={`badge ${tx.network === "BEP20" ? "badge-bep20" : "badge-trc20"} ms-2`}>
                              {tx.network}
                            </span>
                          )}
                        </td>
                        <td>{tx.amount}</td>
                        <td>
                          <span className={`badge bg-${status === "pending" ? "warning" : "success"} text-dark`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td>{tx.created_at ? new Date(tx.created_at).toLocaleString() : "-"}</td>
                      </tr>
                    );
                  })
                }
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
                  <h5 className="modal-title">New Investment</h5>
                  <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Select Coin</label>
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
                                Network!
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
                              ERC20
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
                      <label className="form-label fw-bold">Select USDT Network</label>
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
                    <label className="form-label fw-bold">Deposit Address</label>
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
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Amount</label>
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
                  <button type="submit" className="btn btn-primary">Pay Now</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
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
                  <h5 className="modal-title">Withdrawal</h5>
                  <button type="button" className="btn-close" onClick={() => {
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
                        <label className="form-label fw-bold">Select Coin</label>
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
                          <label className="form-label fw-bold">Select USDT Network</label>
                          <select
                            className="form-select"
                            value={withdrawNetwork}
                            onChange={e => setWithdrawNetwork(e.target.value)}
                            required
                          >
                            <option value="">Select Network</option>
                            <option value="BEP20">BEP20</option>
                            <option value="TRC20">TRC20</option>
                          </select>
                        </div>
                      )}
                      <div className="mb-3">
                        <label className="form-label fw-bold">Withdrawal Amount</label>
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
                        <label className="form-label fw-bold">Wallet Address</label>
                        <input
                          type="text"
                          className="form-control"
                          value={withdrawAddress}
                          onChange={e => setWithdrawAddress(e.target.value)}
                          placeholder="Enter your wallet address"
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
                      Close
                    </button>
                  ) : (
                    <>
                      <button type="submit" className="btn btn-warning">Withdraw</button>
                      <button type="button" className="btn btn-secondary" onClick={() => {
                        setWithdrawModalOpen(false);
                        setWithdrawAddress("");
                        setWithdrawNetwork("");
                      }}>
                        Cancel
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