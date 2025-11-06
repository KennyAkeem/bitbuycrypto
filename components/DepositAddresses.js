import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useTranslation } from "react-i18next";

export default function DepositAddresses() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  // hydration-safe: only call t(...) after mount to avoid SSR/client mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const tSafe = (key, fallback) => (isMounted ? (t(key) || fallback) : fallback);

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchAddresses() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("deposit_addresses")
          .select("id, coin, network, address, updated_at")
          .order("coin", { ascending: true });

        if (!mounted) return;

        if (error) {
          console.error("fetch deposit_addresses error:", error);
          setErrorMsg(error.message || tSafe("deposit.failed", "Failed to load addresses"));
          setAddresses([]);
        } else {
          setAddresses(data || []);
          setErrorMsg("");
        }
      } catch (err) {
        console.error("Unexpected fetch error:", err);
        if (!mounted) return;
        setErrorMsg(getReadableError(err) || tSafe("deposit.failed", "Failed to load addresses"));
        setAddresses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchAddresses();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // safe helper to extract a readable message from thrown values
  function getReadableError(err) {
    if (!err) return "";
    if (typeof err === "string") return err;
    if (err.message) return err.message;
    return "";
  }

  if (loading) return <div>{tSafe("deposit.loading", "Loading deposit addresses…")}</div>;
  if (errorMsg)
    return (
      <div role="alert" style={{ color: "red" }}>
        {errorMsg}
      </div>
    );

  return (
    <div>
      <h3>{tSafe("deposit.title", "Deposit Addresses")}</h3>
      <div>
        {addresses.length === 0 && <div>{tSafe("deposit.none", "No deposit addresses found.")}</div>}
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
              {row.address || <em>{tSafe("deposit.not_set", "Not set")}</em>}
            </div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
              {tSafe("deposit.last_updated", "Last updated")}:{" "}
              {row.updated_at ? new Date(row.updated_at).toLocaleString() : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}