import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/router";

export default function AdminDashboard({ showToast }) {
  const { user, updateUser } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [addresses, setAddresses] = useState({ btc: "", eth: "", usdt: "", sol: "" });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (user === undefined) return;
    if (!user || !user.isAdmin) {
      router.replace("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user || !user.isAdmin) return;
    const allUsers = JSON.parse(localStorage.getItem("users") || "{}");
    setUsers(Object.values(allUsers));
    const storedAddresses = JSON.parse(localStorage.getItem("cryptoAddresses") || "{}");
    setAddresses({
      btc: storedAddresses.btc || "",
      eth: storedAddresses.eth || "",
      usdt: storedAddresses.usdt || "",
      sol: storedAddresses.sol || ""
    });
  }, [user]);

  function approveInvestment(userEmail, investmentId) {
    const allUsers = JSON.parse(localStorage.getItem("users") || "{}");
    const targetUser = allUsers[userEmail];
    if (!targetUser) return;
    targetUser.investments = (targetUser.investments || []).map(inv =>
      inv.id === investmentId ? { ...inv, status: "success" } : inv
    );
    allUsers[userEmail] = targetUser;
    localStorage.setItem("users", JSON.stringify(allUsers));
    setUsers(Object.values(allUsers));
    showToast && showToast("success", "Investment approved!");
  }

  // Approve withdrawal
  function approveWithdrawal(userEmail, withdrawalId) {
    const allUsers = JSON.parse(localStorage.getItem("users") || "{}");
    const targetUser = allUsers[userEmail];
    if (!targetUser) return;
    targetUser.withdrawals = (targetUser.withdrawals || []).map(wd =>
      wd.id === withdrawalId ? { ...wd, status: "success" } : wd
    );
    allUsers[userEmail] = targetUser;
    localStorage.setItem("users", JSON.stringify(allUsers));
    setUsers(Object.values(allUsers));
    showToast && showToast("success", "Withdrawal approved!");
  }

  function saveAddresses(e) {
    e.preventDefault();
    localStorage.setItem("cryptoAddresses", JSON.stringify(addresses));
    setEditMode(false);
    showToast && showToast("success", "Addresses updated!");
  }

  function handleAddressChange(e) {
    setAddresses(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleDeleteUser(email) {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const allUsers = JSON.parse(localStorage.getItem("users") || "{}");
      delete allUsers[email];
      localStorage.setItem("users", JSON.stringify(allUsers));
      setUsers(Object.values(allUsers));
      showToast && showToast("success", "User deleted.");
    }
  }

  // Investment and withdrawal lists
  const allInvestments = [];
  const allWithdrawals = [];
  users.forEach(u => {
    (u.investments || []).forEach(inv => {
      allInvestments.push({ ...inv, user: u });
    });
    (u.withdrawals || []).forEach(wd => {
      allWithdrawals.push({ ...wd, user: u });
    });
  });

  if (user === undefined) return <div>Loading...</div>;
  if (!user || !user.isAdmin) return null;

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col-md-10 mx-auto">
          <h2 className="fw-bold text-danger mb-2">Admin Dashboard</h2>
          <p className="text-muted">Welcome, {user.name}. Manage users, investments, withdrawals, and addresses here.</p>
        </div>
      </div>
      {/* Crypto Deposit Addresses */}
      <div className="row mb-5">
        <div className="col-md-10 mx-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="fw-bold">Deposit Addresses</h5>
            {!editMode && (
              <button className="btn btn-outline-primary btn-sm" onClick={() => setEditMode(true)}>
                Edit
              </button>
            )}
          </div>
          <form onSubmit={saveAddresses}>
            <div className="row g-3 mb-2">
              {["btc", "eth", "usdt", "sol"].map(coin => (
                <div className="col-md-3" key={coin}>
                  <label className="form-label text-uppercase fw-bold">{coin}</label>
                  <input
                    type="text"
                    className="form-control"
                    name={coin}
                    value={addresses[coin]}
                    onChange={handleAddressChange}
                    disabled={!editMode}
                    placeholder={`Enter ${coin.toUpperCase()} address`}
                  />
                </div>
              ))}
            </div>
            {editMode && (
              <button type="submit" className="btn btn-primary btn-sm">Save Addresses</button>
            )}
          </form>
        </div>
      </div>
      {/* Investments Table */}
      <div className="row mb-5">
        <div className="col-md-10 mx-auto">
          <h5 className="fw-bold mb-3">All Investments</h5>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-secondary">
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
                {allInvestments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">No investments found.</td>
                  </tr>
                ) : (
                  allInvestments.map(inv => (
                    <tr key={inv.id}>
                      <td>{inv.user.name} <br /><span className="text-muted">{inv.user.email}</span></td>
                      <td className="fw-bold text-uppercase">{inv.coin}</td>
                      <td>{inv.amount}</td>
                      <td>
                        <span className={`badge bg-${inv.status === "pending" ? "warning" : "success"} text-dark`}>
                          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </span>
                      </td>
                      <td>{new Date(inv.timestamp).toLocaleString()}</td>
                      <td>
                        {inv.status === "pending" ? (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => approveInvestment(inv.user.email, inv.id)}
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-success fw-bold">Approved</span>
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
      {/* Withdrawals Table */}
      <div className="row mb-5">
        <div className="col-md-10 mx-auto">
          <h5 className="fw-bold mb-3">All Withdrawals</h5>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-secondary">
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
                {allWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">No withdrawals found.</td>
                  </tr>
                ) : (
                  allWithdrawals.map(wd => (
                    <tr key={wd.id}>
                      <td>{wd.user.name} <br /><span className="text-muted">{wd.user.email}</span></td>
                      <td className="fw-bold text-uppercase">{wd.coin}</td>
                      <td>{wd.amount}</td>
                      <td>
                        <span className={`badge bg-${wd.status === "pending" ? "warning" : "success"} text-dark`}>
                          {wd.status.charAt(0).toUpperCase() + wd.status.slice(1)}
                        </span>
                      </td>
                      <td>{new Date(wd.timestamp).toLocaleString()}</td>
                      <td>
                        {wd.status === "pending" ? (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => approveWithdrawal(wd.user.email, wd.id)}
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-success fw-bold">Approved</span>
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
      {/* Users Table */}
      <div className="row mb-5">
        <div className="col-md-10 mx-auto">
          <h5 className="fw-bold mb-3">Registered Users</h5>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-secondary">
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
                  users.map(u => (
                    <tr key={u.email}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.isAdmin ? "Yes" : "No"}</td>
                      <td>{u.created_at ? new Date(u.created_at).toLocaleString() : ""}</td>
                      <td>{(u.investments || []).length}</td>
                      <td>
                        {u.isAdmin ? (
                          <span className="text-muted">Admin</span>
                        ) : (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(u.email)}
                          >
                            Delete
                          </button>
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
    </div>
  );
}