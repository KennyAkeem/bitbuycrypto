// components/DepositAddresses.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function DepositAddresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchAddresses() {
      setLoading(true);
      const { data, error } = await supabase
        .from("deposit_addresses")
        .select("id, coin, network, address, updated_at")
        .order("coin", { ascending: true });

      if (!mounted) return;
      if (error) {
        console.error("fetch deposit_addresses error:", error);
        setErrorMsg(error.message || "Failed to load addresses");
        setAddresses([]);
      } else {
        setAddresses(data || []);
        setErrorMsg("");
      }
      setLoading(false);
    }
    fetchAddresses();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading deposit addresses…</div>;
  if (errorMsg) return <div style={{ color: "red" }}>{errorMsg}</div>;

  return (
    <div>
      <h3>Deposit Addresses</h3>
      <div>
        {addresses.length === 0 && <div>No deposit addresses found.</div>}
        {addresses.map((row) => (
          <div
            key={row.id}
            style={{
              marginBottom: 12,
              padding: 8,
              border: "1px solid #eee",
              borderRadius: 6,
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {row.coin} {row.network ? `(${row.network})` : ""}
            </div>
            <div style={{ fontFamily: "monospace", marginTop: 6 }}>
              {row.address || <em>Not set</em>}
            </div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
              Last updated:{" "}
              {row.updated_at
                ? new Date(row.updated_at).toLocaleString()
                : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
