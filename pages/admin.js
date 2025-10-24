import { supabase } from "../lib/supabaseClient";
import { useEffect, useState, useMemo } from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/router";

export default function AdminDashboard({ showToast }) {
  const { user } = useUser();
  const router = useRouter();

  // Data
  const [users, setUsers] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  // For addresses: now an array of wallet address objects
  const [addresses, setAddresses] = useState([]);
  const [editMode, setEditMode] = useState(false);
  // For editing addresses
  const [editAddresses, setEditAddresses] = useState({
    btc: "",
    eth: "",
    usdt_bep20: "",
    usdt_trc20: ""
  });

  // UI
  const [selectedTab, setSelectedTab] = useState("overview");

  // Redirect if not admin
  useEffect(() => {
    if (user === undefined) return;
    if (!user || !user.is_admin) {
      router.replace("/");
    }
  }, [user, router]);

  // Initial Fetch (users, addresses, investments, withdrawals, logs)
  useEffect(() => {
    let isMounted = true;

    async function fetchAll() {
      if (!isMounted) return;

      try {
        // Profiles
        const { data: usersData } = await supabase.from("profiles").select("*");
        if (isMounted && usersData) setUsers(usersData);

        // Investments
        const { data: invData } = await supabase.from("investments").select("*");
        if (isMounted && invData) setInvestments(invData);

        // Withdrawals
        const { data: wdData } = await supabase.from("withdrawals").select("*");
        if (isMounted && wdData) setWithdrawals(wdData);

        // Wallet addresses
        const { data: addrData } = await supabase
          .from("wallet_addresses")
          .select("*");
        if (isMounted && Array.isArray(addrData)) {
          setAddresses(addrData);
          // Map for editing form
          setEditAddresses({
            btc: addrData.find(a => a.coin === "btc")?.address || "",
            eth: addrData.find(a => a.coin === "eth" && a.network === "ERC20")?.address || "",
            usdt_bep20: addrData.find(a => a.coin === "usdt" && a.network === "BEP20")?.address || "",
            usdt_trc20: addrData.find(a => a.coin === "usdt" && a.network === "TRC20")?.address || "",
          });
        }

        // User Activity Logs (latest 200)
        const { data: logsData, error: logsError } = await supabase
          .from("user_activity")
          .select("id, user_id, event, description, ip, city, region, country, created_at")
          .order("created_at", { ascending: false })
          .limit(200);

        if (isMounted) {
          if (!logsError && logsData) setActivityLogs(logsData);
          else if (logsError) console.error("Error fetching user activity:", logsError);
        }
      } catch (err) {
        console.error("Error in fetchAll:", err);
      }
    }

    fetchAll();

    return () => {
      isMounted = false;
    };
  }, []);

  // Realtime subscription
  useEffect(() => {
    const invChannel = supabase
      .channel("realtime_investments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "investments" },
        (payload) => {
          setInvestments((prev) => [payload.new, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "investments" },
        (payload) => {
          setInvestments((prev) =>
            prev.map((i) => (i.id === payload.new.id ? payload.new : i))
          );
        }
      )
      .subscribe();

    const wdChannel = supabase
      .channel("realtime_withdrawals")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "withdrawals" },
        (payload) => {
          setWithdrawals((prev) => [payload.new, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "withdrawals" },
        (payload) => {
          setWithdrawals((prev) =>
            prev.map((w) => (w.id === payload.new.id ? payload.new : w))
          );
        }
      )
      .subscribe();

    const logChannel = supabase
      .channel("realtime_user_activity")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_activity" },
        (payload) => {
          setActivityLogs((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(invChannel);
      supabase.removeChannel(wdChannel);
      supabase.removeChannel(logChannel);
    };
  }, []);

  // Address handlers
  function handleAddressChange(e) {
    const { name, value } = e.target;
    setEditAddresses((prev) => ({ ...prev, [name]: value }));
  }

  // Fixed saveAddresses: single implementation, normalizes to DB-expected network values,
  // filters out empty addresses to avoid blanking rows, upserts using onConflict on (coin,network),
  // refreshes UI state and shows detailed error logging when present.
  async function saveAddresses(e) {
    e.preventDefault();
    try {
      // Build rows from the form state (editAddresses)
      const rows = [
        {
          coin: "btc",
          network: "mainnet",
          address: (editAddresses.btc || "").trim(),
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null,
        },
        {
          coin: "eth",
          network: "ERC20",
          address: (editAddresses.eth || "").trim(),
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null,
        },
        {
          coin: "usdt",
          network: "BEP20",
          address: (editAddresses.usdt_bep20 || "").trim(),
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null,
        },
        {
          coin: "usdt",
          network: "TRC20",
          address: (editAddresses.usdt_trc20 || "").trim(),
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null,
        }
      ];

      // Only upsert rows that have a non-empty address (avoid blanking rows unintentionally)
      const rowsToUpsert = rows.filter(r => r.address.length > 0);

      if (rowsToUpsert.length === 0) {
        showToast && showToast("error", "No addresses provided.");
        return;
      }

      // Use onConflict as an array and request representation for returned rows
      const { data, error } = await supabase
        .from("wallet_addresses")
        .upsert(rowsToUpsert, { onConflict: ["coin", "network"], returning: "representation" });

      if (error) {
        // Log detailed error info — PostgREST / Supabase return helpful fields
        console.error("wallet_addresses upsert error:", error);
        showToast && showToast("error", `Failed to update addresses: ${error.message || "Unknown error"}`);
        return;
      }

      // Refresh UI state from DB
      const { data: addrData, error: selectErr } = await supabase.from("wallet_addresses").select("*");

      if (selectErr) {
        console.error("fetch after upsert failed:", selectErr);
        showToast && showToast("warning", "Addresses updated but failed to refresh list.");
      } else {
        setAddresses(addrData || []);
        setEditAddresses({
          btc: addrData.find(a => a.coin === "btc" && a.network === "mainnet")?.address || "",
          eth: addrData.find(a => a.coin === "eth" && a.network === "ERC20")?.address || "",
          usdt_bep20: addrData.find(a => a.coin === "usdt" && a.network === "BEP20")?.address || "",
          usdt_trc20: addrData.find(a => a.coin === "usdt" && a.network === "TRC20")?.address || "",
        });
        setEditMode(false);
        showToast && showToast("success", "Addresses updated successfully!");
      }
    } catch (err) {
      console.error("saveAddresses err:", err);
      showToast && showToast("error", "Failed to update addresses.");
    }
  }

  // Approve / Delete actions
  async function approveWithdrawal(withdrawalId) {
    try {
      const { error } = await supabase.from("withdrawals").update({ status: "success" }).eq("id", withdrawalId);
      if (!error) showToast && showToast("success", "Withdrawal approved!");
      else showToast && showToast("error", "Failed to approve withdrawal.");
    } catch (err) {
      console.error("approveWithdrawal err:", err);
      showToast && showToast("error", "Failed to approve withdrawal.");
    }
  }

  async function approveInvestment(investmentId) {
    try {
      const { error } = await supabase.from("investments").update({ status: "success" }).eq("id", investmentId);
      if (!error) showToast && showToast("success", "Investment approved!");
      else showToast && showToast("error", "Failed to approve investment.");
    } catch (err) {
      console.error("approveInvestment err:", err);
      showToast && showToast("error", "Failed to approve investment.");
    }
  }

  async function handleDeleteUser(userId) {
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", userId);
      if (!error) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        showToast && showToast("success", "User deleted!");
      } else {
        showToast && showToast("error", "Failed to delete user.");
      }
    } catch (err) {
      console.error("handleDeleteUser err:", err);
      showToast && showToast("error", "Failed to delete user.");
    }
  }

  function getUserById(id) {
    return users.find((u) => u.id === id) || {};
  }

  // Derived metrics for Overview
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const pendingInv = investments.filter((i) => i.status === "pending").length;
    const pendingWd = withdrawals.filter((w) => w.status === "pending").length;
    const totalInvestmentsSum = investments.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);
    return { totalUsers, pendingInv, pendingWd, totalInvestmentsSum };
  }, [users, investments, withdrawals]);

  if (user === undefined) return <div>Loading...</div>;
  if (!user || !user.is_admin) return null;

  return (
    <div className="container py-4">
      <div className="header-row mb-4">
        <h2 className="title">Admin Dashboard</h2>
        <p className="subtitle">Welcome, {user?.name}. Manage the platform below.</p>
      </div>

      {/* Tabs - Desktop */}
      <div className="mb-3">
        <nav className="tabs d-none d-md-flex" role="tablist" aria-label="Admin sections">
          {[
            { id: "overview", label: "Overview" },
            { id: "investments", label: "Investments" },
            { id: "withdrawals", label: "Withdrawals" },
            { id: "users", label: "Users" },
            { id: "addresses", label: "Addresses" },
            { id: "activity", label: "Activity" },
          ].map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${selectedTab === t.id ? "active" : ""}`}
              onClick={() => setSelectedTab(t.id)}
              role="tab"
              aria-selected={selectedTab === t.id}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Mobile: compact select to switch tabs */}
        <div className="d-block d-md-none">
          <label className="form-label visually-hidden" htmlFor="mobile-tab-select">
            Select section
          </label>
          <select
            id="mobile-tab-select"
            className="form-select"
            value={selectedTab}
            onChange={(e) => setSelectedTab(e.target.value)}
          >
            <option value="overview">Overview</option>
            <option value="investments">Investments</option>
            <option value="withdrawals">Withdrawals</option>
            <option value="users">Users</option>
            <option value="addresses">Addresses</option>
            <option value="activity">Activity</option>
          </select>
        </div>
      </div>

      {/* Tab panels */}
      <section className={`panel ${selectedTab === "overview" ? "show" : "hide"}`} aria-hidden={selectedTab !== "overview"}>
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-10">
            <div className="overview-cards">
              <div className="card small-card">
                <div className="card-body">
                  <div className="card-title">Total Users</div>
                  <div className="card-value">{metrics.totalUsers}</div>
                </div>
              </div>
              <div className="card small-card">
                <div className="card-body">
                  <div className="card-title">Pending Investments</div>
                  <div className="card-value">{metrics.pendingInv}</div>
                </div>
              </div>
              <div className="card small-card">
                <div className="card-body">
                  <div className="card-title">Pending Withdrawals</div>
                  <div className="card-value">{metrics.pendingWd}</div>
                </div>
              </div>
              <div className="card small-card">
                <div className="card-body">
                  <div className="card-title">Total Invested</div>
                  <div className="card-value">${Number(metrics.totalInvestmentsSum).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`panel ${selectedTab === "investments" ? "show" : "hide"}`} aria-hidden={selectedTab !== "investments"}>
        <div className="row mb-4">
          <div className="col-md-10">
            <h5 className="section-heading">All Investments</h5>
            <div className="table-responsive">
              <table className="table styled-table responsive-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Coin</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted">No investments found.</td>
                    </tr>
                  ) : (
                    investments.map((inv) => {
                      const invUser = getUserById(inv.user_id);
                      return (
                        <tr key={inv.id}>
                          <td data-label="User">
                            <div className="cell-title">{invUser.name}</div>
                            <div className="cell-sub">{invUser.email}</div>
                          </td>
                          <td data-label="Coin" className="fw-bold text-uppercase">
                            {inv.coin}
                            {inv.coin === "eth" && <span className="badge badge-erc20 ms-2">ERC20</span>}
                            {inv.coin === "usdt" && inv.network && (
                              <span className={`badge ${inv.network === "BEP20" ? "badge-bep20" : "badge-trc20"} ms-2`}>
                                {inv.network}
                              </span>
                            )}
                          </td>
                          <td data-label="Amount">{inv.amount}</td>
                          <td data-label="Status">
                            <span className={`badge ${inv.status === "pending" ? "badge-warning" : "badge-success"}`}>
                              {inv.status?.charAt(0).toUpperCase() + (inv.status?.slice(1) || "")}
                            </span>
                          </td>
                          <td data-label="Time">{inv.created_at ? new Date(inv.created_at).toLocaleString() : ""}</td>
                          <td data-label="Action">
                            {inv.status === "pending" ? (
                              <button className="btn btn-success btn-sm" onClick={() => approveInvestment(inv.id)}>Approve</button>
                            ) : (
                              <span className="text-success fw-bold">Approved</span>
                            )}
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
      </section>

      <section className={`panel ${selectedTab === "withdrawals" ? "show" : "hide"}`} aria-hidden={selectedTab !== "withdrawals"}>
        <div className="row mb-4">
          <div className="col-md-10">
            <h5 className="section-heading">All Withdrawals</h5>
            <div className="table-responsive">
              <table className="table styled-table responsive-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Coin</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted">No withdrawals found.</td>
                    </tr>
                  ) : (
                    withdrawals.map((wd) => {
                      const wdUser = getUserById(wd.user_id);
                      return (
                        <tr key={wd.id}>
                          <td data-label="User">
                            <div className="cell-title">{wdUser.name}</div>
                            <div className="cell-sub">{wdUser.email}</div>
                          </td>
                          <td data-label="Coin" className="fw-bold text-uppercase">
                            {wd.coin}
                            {wd.coin === "eth" && <span className="badge badge-erc20 ms-2">ERC20</span>}
                            {wd.coin === "usdt" && wd.network && (
                              <span className={`badge ${wd.network === "BEP20" ? "badge-bep20" : "badge-trc20"} ms-2`}>
                                {wd.network}
                              </span>
                            )}
                          </td>
                          <td data-label="Amount">{wd.amount}</td>
                          <td data-label="Status">
                            <span className={`badge ${wd.status === "pending" ? "badge-warning" : "badge-success"}`}>
                              {wd.status?.charAt(0).toUpperCase() + (wd.status?.slice(1) || "")}
                            </span>
                          </td>
                          <td data-label="Time">{wd.created_at ? new Date(wd.created_at).toLocaleString() : ""}</td>
                          <td data-label="Action">
                            {wd.status === "pending" ? (
                              <button className="btn btn-success btn-sm" onClick={() => approveWithdrawal(wd.id)}>Approve</button>
                            ) : (
                              <span className="text-success fw-bold">Approved</span>
                            )}
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
      </section>

      <section className={`panel ${selectedTab === "users" ? "show" : "hide"}`} aria-hidden={selectedTab !== "users"}>
        <div className="row mb-4">
          <div className="col-md-10">
            <h5 className="section-heading">Registered Users</h5>
            <div className="table-responsive">
              <table className="table styled-table responsive-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Admin?</th>
                    <th>Created At</th>
                    <th>Total Investments</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted">No users found.</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td data-label="Name">{u.name}</td>
                        <td data-label="Email">{u.email}</td>
                        <td data-label="Admin?">{u.is_admin ? "Yes" : "No"}</td>
                        <td data-label="Created At">{u.created_at ? new Date(u.created_at).toLocaleString() : ""}</td>
                        <td data-label="Total Investments">{investments.filter((inv) => inv.user_id === u.id).length}</td>
                        <td data-label="Actions">
                          {u.is_admin ? (
                            <span className="text-muted">Admin</span>
                          ) : (
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className={`panel ${selectedTab === "addresses" ? "show" : "hide"}`} aria-hidden={selectedTab !== "addresses"}>
        <div className="row mb-4">
          <div className="col-md-10">
            <h5 className="section-heading">Deposit Addresses</h5>
            {!editMode ? (
              <div className="addresses-grid mb-2">
                <div className="address-card">
                  <div className="coin">BTC</div>
                  <div className="address">{editAddresses.btc}</div>
                </div>
                <div className="address-card">
                  <div className="coin">ETH <span className="badge badge-erc20 ms-2">ERC20</span></div>
                  <div className="address">{editAddresses.eth}</div>
                </div>
                <div className="address-card">
                  <div className="coin">USDT <span className="badge badge-bep20 ms-2">BSC BEP20</span></div>
                  <div className="address">{editAddresses.usdt_bep20}</div>
                </div>
                <div className="address-card">
                  <div className="coin">USDT <span className="badge badge-trc20 ms-2">TRC20</span></div>
                  <div className="address">{editAddresses.usdt_trc20}</div>
                </div>
                <div className="actions">
                  <button className="btn btn-outline-primary btn-sm" onClick={() => setEditMode(true)}>Edit</button>
                </div>
              </div>
            ) : (
              <form onSubmit={saveAddresses}>
                <div className="row g-3 mb-2">
                  <div className="col-12 col-md-3">
                    <label className="form-label text-uppercase fw-bold">BTC</label>
                    <input
                      type="text"
                      className="form-control"
                      name="btc"
                      value={editAddresses.btc}
                      onChange={handleAddressChange}
                      placeholder="Enter BTC address"
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <label className="form-label text-uppercase fw-bold">ETH (ERC20)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="eth"
                      value={editAddresses.eth}
                      onChange={handleAddressChange}
                      placeholder="Enter ETH (ERC20) address"
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <label className="form-label text-uppercase fw-bold">USDT (BSC BEP20)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="usdt_bep20"
                      value={editAddresses.usdt_bep20}
                      onChange={handleAddressChange}
                      placeholder="Enter USDT (BEP20) address"
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <label className="form-label text-uppercase fw-bold">USDT (TRC20)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="usdt_trc20"
                      value={editAddresses.usdt_trc20}
                      onChange={handleAddressChange}
                      placeholder="Enter USDT (TRC20) address"
                    />
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary btn-sm">Save Addresses</button>
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditMode(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className={`panel ${selectedTab === "activity" ? "show" : "hide"}`} aria-hidden={selectedTab !== "activity"}>
        <div className="row mb-4">
          <div className="col-md-10">
            <h5 className="section-heading">User Activity Logs</h5>
            <div className="table-responsive">
              <table className="table styled-table responsive-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Activity</th>
                    <th>IP Address</th>
                    <th>Country</th>
                    <th>Region</th>
                    <th>City</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted">No recent activity found.</td>
                    </tr>
                  ) : (
                    activityLogs.map((log) => {
                      const logUser = getUserById(log.user_id);
                      return (
                        <tr key={log.id}>
                          <td data-label="User">{logUser?.name || "Unknown"}</td>
                          <td data-label="Activity">{log.description}</td>
                          <td data-label="IP Address">{log.ip}</td>
                          <td data-label="Country">{log.country}</td>
                          <td data-label="Region">{log.region}</td>
                          <td data-label="City">{log.city}</td>
                          <td data-label="Time">{log.created_at ? new Date(log.created_at).toLocaleString() : ""}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .header-row .title {
          margin: 0;
          font-weight: 700;
          color: #e11d48;
        }
        .header-row .subtitle {
          margin: 0;
          color: #6b7280;
        }

        .tabs {
          gap: 0.5rem;
        }
        .tab-btn {
          background: transparent;
          border: 1px solid transparent;
          padding: 0.55rem 0.9rem;
          border-radius: 12px;
          cursor: pointer;
          color: #374151;
          font-weight: 600;
        }
        .tab-btn:hover { background: rgba(0,0,0,0.03); }
        .tab-btn.active {
          background: linear-gradient(90deg, #f97316, #ef4444);
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.14);
        }

        .overview-cards {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .small-card {
          flex: 1 1 160px;
          min-width: 160px;
          border-radius: 12px;
          border: none;
          box-shadow: 0 6px 18px rgba(17, 24, 39, 0.06);
        }
        .small-card .card-body {
          padding: 1rem;
        }
        .card-title {
          font-size: 0.9rem;
          color: #6b7280;
        }
        .card-value {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .section-heading {
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .addresses-grid {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: center;
        }
        .address-card {
          background: #f8fafc;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          min-width: 200px;
        }
        .address-card .coin {
          font-weight: 700;
          margin-bottom: 0.35rem;
        }
        .address-card .address {
          word-break: break-all;
          color: #374151;
          font-size: 0.9rem;
        }

        .badge {
          padding: 0.35rem 0.6rem;
          border-radius: 999px;
          font-weight: 700;
          color: #111827;
        }
        .badge-warning {
          background: #fef3c7;
        }
        .badge-success {
          background: #bbf7d0;
        }
        .badge-erc20 {
          background-color: #6f42c1 !important;
          color: #fff !important;
        }
        .badge-bep20 {
          background-color: #198754 !important;
          color: #fff !important;
        }
        .badge-trc20 {
          background-color: #ff9800 !important;
          color: #fff !important;
        }

        @media (max-width: 767px) {
          .responsive-table thead {
            display: none;
          }
          .responsive-table tbody tr {
            display: block;
            border: 1px solid #e6e6e6;
            margin-bottom: 0.75rem;
            border-radius: 8px;
            padding: 0.5rem 0.75rem;
          }
          .responsive-table tbody tr td {
            display: flex;
            justify-content: space-between;
            padding: 0.375rem 0;
            border: none;
          }
          .responsive-table tbody tr td .cell-title {
            font-weight: 700;
          }
          .responsive-table tbody tr td .cell-sub {
            font-size: 0.85rem;
            color: #6b7280;
          }
          .responsive-table tbody tr td[data-label]::before {
            content: attr(data-label);
            font-weight: 600;
            color: #6b7280;
            margin-right: 0.5rem;
          }
        }

        .panel.hide { display: none; }
        .panel.show { display: block; }
        .actions { display:flex; align-items:center; gap:0.5rem; }
      `}</style>
    </div>
  );
}