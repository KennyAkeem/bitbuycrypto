// components/AdminDepositForm.js
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminDepositForm() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing addresses
  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    setLoading(true);
    const { data, error } = await supabase
      .from("deposit_addresses")
      .select("*")
      .order("coin", { ascending: true });

    if (error) setError(error.message);
    else setAddresses(data || []);
    setLoading(false);
  }

  // Handle input changes
  function handleChange(index, field, value) {
    const newList = [...addresses];
    newList[index][field] = value;
    setAddresses(newList);
  }

  // Save (insert or update)
  async function handleSave(index) {
    const item = addresses[index];
    setSaving(true);

    // check if exists (by coin)
    const { data: existing } = await supabase
      .from("deposit_addresses")
      .select("id")
      .eq("coin", item.coin)
      .single();

    let res;
    if (existing) {
      res = await supabase
        .from("deposit_addresses")
        .update({
          address: item.address,
          network: item.network,
          updated_at: new Date(),
        })
        .eq("coin", item.coin);
    } else {
      res = await supabase.from("deposit_addresses").insert([{
        coin: item.coin,
        network: item.network,
        address: item.address,
      }]);
    }

    if (res.error) {
      alert("Error saving: " + res.error.message);
    } else {
      alert("Saved successfully!");
      loadAddresses();
    }
    setSaving(false);
  }

  // Add new blank row
  function handleAdd() {
    setAddresses([...addresses, { coin: "", network: "", address: "" }]);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h3>Admin: Manage Deposit Addresses</h3>
      {addresses.map((row, i) => (
        <div key={i} style={{ border: "1px solid #eee", padding: 12, marginBottom: 10, borderRadius: 8 }}>
          <input
            type="text"
            placeholder="Coin (e.g. BTC)"
            value={row.coin}
            onChange={(e) => handleChange(i, "coin", e.target.value)}
            style={{ marginRight: 10 }}
          />
          <input
            type="text"
            placeholder="Network (optional)"
            value={row.network || ""}
            onChange={(e) => handleChange(i, "network", e.target.value)}
            style={{ marginRight: 10 }}
          />
          <input
            type="text"
            placeholder="Address"
            value={row.address}
            onChange={(e) => handleChange(i, "address", e.target.value)}
            style={{ marginRight: 10, width: "40%" }}
          />
          <button onClick={() => handleSave(i)} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      ))}
      <button onClick={handleAdd}>+ Add New Coin</button>
    </div>
  );
}
