import { useEffect, useState, useRef } from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/router";
import CryptoPriceMarquee from "../components/CryptoPriceMarquee";
import SimulatedAlert from "../components/SimulatedAlert";

function getCoinBalances(investments, withdrawals) {
  const balances = {};
  investments.forEach(inv => {
    balances[inv.coin] = (balances[inv.coin] || 0) + inv.amount;
  });
  withdrawals.forEach(wd => {
    if (wd.status === "success") {
      balances[wd.coin] = (balances[wd.coin] || 0) - wd.amount;
    }
  });
  return balances;
}

export default function Profile({ showToast }) {
  const { user, updateUser, logout } = useUser();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [coin, setCoin] = useState("btc");
  const [amount, setAmount] = useState("");
  const [addresses, setAddresses] = useState({ btc: "", eth: "", usdt: "", sol: "" });
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawCoin, setWithdrawCoin] = useState("btc");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMsg, setWithdrawMsg] = useState("");
  const [withdrawErr, setWithdrawErr] = useState("");
  // Profile edit states
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPic, setEditPic] = useState(user?.profilePic || "");
  const [picPreview, setPicPreview] = useState(user?.profilePic || "");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) router.replace("/");
    const stored = JSON.parse(localStorage.getItem("cryptoAddresses") || "{}");
    setAddresses({
      btc: stored.btc || "",
      eth: stored.eth || "",
      usdt: stored.usdt || "",
      sol: stored.sol || ""
    });
    setEditName(user?.name || "");
    setEditPic(user?.profilePic || "");
    setPicPreview(user?.profilePic || "");
  }, [user, router]);

  const investments = user?.investments || [];
  const withdrawals = user?.withdrawals || [];
  const balances = getCoinBalances(investments, withdrawals);

  // Edit profile logic
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

  // FIX: Limit profile picture size before saving to localStorage
  function handlePicChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    // Limit to 200KB
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
      const allUsers = JSON.parse(localStorage.getItem("users") || "{}");
      delete allUsers[user.email];
      localStorage.setItem("users", JSON.stringify(allUsers));
      logout();
      showToast && showToast("success", "Account deleted!");
      router.replace("/");
    }
  }

  // Deposit
  function handleInvest(e) {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showToast && showToast("error", "Enter a valid amount!");
      return;
    }
    const newInvestment = {
      id: Date.now(),
      coin,
      amount: Number(amount),
      status: "pending",
      timestamp: new Date().toISOString()
    };
    updateUser({
      ...user,
      investments: [...investments, newInvestment]
    });
    showToast && showToast("success", "Deposit successful!");
    setModalOpen(false);
    setAmount("");
    setCoin("btc");
  }

  function handleWithdraw() {
    const coinsWithFunds = Object.entries(balances).filter(([c, amt]) => amt > 0);
    if (coinsWithFunds.length === 0) {
      setWithdrawMsg("Nothing to withdraw yet. Invest now to start earning!");
      setWithdrawCoin("btc");
      setWithdrawAmount("");
      setWithdrawModalOpen(true);
    } else {
      setWithdrawMsg("");
      setWithdrawCoin(coinsWithFunds[0][0]);
      setWithdrawAmount("");
      setWithdrawErr("");
      setWithdrawModalOpen(true);
    }
  }

  function submitWithdraw(e) {
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
    const newWithdrawal = {
      id: Date.now(),
      coin: withdrawCoin,
      amount: amtNum,
      status: "pending",
      timestamp: new Date().toISOString()
    };
    updateUser({
      ...user,
      withdrawals: [...withdrawals, newWithdrawal]
    });
    showToast && showToast("info", `Withdrawal request submitted for ${amtNum} ${withdrawCoin.toUpperCase()}. Waiting admin approval.`, 4000);
    setWithdrawModalOpen(false);
    setWithdrawAmount("");
    setWithdrawCoin("btc");
    setWithdrawErr("");
  }

  if (user === undefined) return <div>Loading...</div>;
  if (!user) return <div>Not authorized</div>;

  return (
    <div className="container py-4">
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
                  investments.map(inv => (
                    <tr key={inv.id}>
                      <td className="fw-bold text-uppercase">{inv.coin}</td>
                      <td>{inv.amount}</td>
                      <td>
                        <span className={`badge bg-${inv.status === "pending" ? "warning" : "success"} text-dark`}>
                          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </span>
                      </td>
                      <td>{new Date(inv.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
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
      {/* Transaction History */}
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
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map(tx => (
                    <tr key={tx.id}>
                      <td>{tx.type}</td>
                      <td className="fw-bold text-uppercase">{tx.coin}</td>
                      <td>{tx.amount}</td>
                      <td>
                        <span className={`badge bg-${tx.status === "pending" ? "warning" : "success"} text-dark`}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </td>
                      <td>{new Date(tx.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
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
                      {["btc", "eth", "usdt", "sol"].map(c => (
                        <button
                          key={c}
                          type="button"
                          className={`btn btn-outline-${coin === c ? "primary" : "secondary"}`}
                          onClick={() => setCoin(c)}
                        >
                          {c.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Deposit Address</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={addresses[coin] || ""}
                        readOnly
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigator.clipboard.writeText(addresses[coin] || "")}
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
                  <button type="button" className="btn-close" onClick={() => setWithdrawModalOpen(false)}></button>
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
                          }}
                        >
                          {Object.entries(balances)
                            .filter(([c, amt]) => amt > 0)
                            .map(([c, amt]) => (
                              <option key={c} value={c}>{c.toUpperCase()} (balance: {amt})</option>
                            ))}
                        </select>
                      </div>
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
                      
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  {withdrawMsg ? (
                    <button type="button" className="btn btn-primary" onClick={() => setWithdrawModalOpen(false)}>
                      Close
                    </button>
                  ) : (
                    <>
                      <button type="submit" className="btn btn-warning">Withdraw</button>
                      <button type="button" className="btn btn-secondary" onClick={() => setWithdrawModalOpen(false)}>
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