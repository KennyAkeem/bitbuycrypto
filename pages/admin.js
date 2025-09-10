import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/router";

export default function AdminDashboard() {
  const { user } = useUser();
  const [users, setUsers] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) return;
    if (!user || !user.isAdmin) {
      router.replace("/");
    } else {
      const allUsers = JSON.parse(localStorage.getItem("users") || "{}");
      setUsers(Object.values(allUsers));
    }
  }, [user, router]);

  if (user === undefined || users === null) return <div>Loading...</div>;
  if (!user || !user.isAdmin) return <div>Not authorized</div>;

  return (
    <div style={{
      background: "#23272f",
      minHeight: "100vh",
      padding: "3rem 0"
    }}>
      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "2rem",
        background: "#fffbe6",
        borderRadius: 16,
        border: "4px solid #f44336",
        boxShadow: "0 4px 24px #f4433622"
      }}>
        <h1 style={{
          color: "#f44336",
          fontWeight: "900",
          fontSize: "2.6rem",
          textTransform: "uppercase",
          letterSpacing: 4,
          textAlign: "center"
        }}>
          ADMIN DASHBOARD
        </h1>
        <div style={{
          margin: "1.5rem 0 2rem 0",
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
          padding: "1rem",
          borderRadius: 8,
          textAlign: "center",
          fontSize: "1.2rem",
          letterSpacing: 2
        }}>
          ⚠️ Restricted Area: Admins Only ⚠️
        </div>
        <div style={{
          marginBottom: "2rem",
          textAlign: "center",
          color: "#23272f",
          fontWeight: "bold"
        }}>
          Welcome, <span style={{color:'#d84315'}}>{user.name}</span>! Here you can view and manage all users.
        </div>

        <h2 style={{
          color: "#d84315",
          marginBottom: "1rem"
        }}>
          👥 Registered Users
        </h2>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          border: "1.5px solid #f44336"
        }}>
          <thead>
            <tr className="td">
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Admin?</th>
              <th style={thStyle}>Created At</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.email} style={{background: u.isAdmin ? '#100' : '#100'}}>
                <td style={tdStyle}>{u.name}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={{...tdStyle, color: u.isAdmin ? "#f44336" : "#111", fontWeight: "bold"}}>
                  {u.isAdmin ? "✅ Admin" : "—"}
                </td>
                <td style={tdStyle}>{u.created_at ? new Date(u.created_at).toLocaleString() : ""}</td>
                <td style={tdStyle}>
                  <button style={{...actionBtn, opacity: 0.4}} disabled>Promote</button>
                  <button style={{...actionBtn, background: "#d84315", opacity: 0.4}} disabled>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div style={{ marginTop: "2rem", color: "#888" }}>No users found.</div>
        )}
        <div style={{
          marginTop: "2.5rem",
          color: "#f44336",
          fontWeight: "bold",
          fontSize: "1.2rem",
          textAlign: "center"
        }}>
          <span role="img" aria-label="shield">🛡️</span> You have ADMIN privileges <span role="img" aria-label="shield">🛡️</span>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  borderBottom: "2px solid #f44336",
  padding: "0.85rem",
  textAlign: "left",
  fontWeight: "bold",
  background: "#ffeaea",
  fontSize: "1.08rem"
};
const tdStyle = {
  borderBottom: "1px solid #f44336",
  padding: "0.7rem"
};
const actionBtn = {
  background: "#f44336",
  border: "none",
  borderRadius: "4px",
  color: "#fff",
  fontWeight: "bold",
  padding: "0.45em 1.1em",
  marginRight: "0.4em",
  cursor: "not-allowed"
};