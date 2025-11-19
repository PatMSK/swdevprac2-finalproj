"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Protected from "../../../components/Protected";
import { useAuth } from "../../../lib/AuthContext";
import { api } from "../../../lib/api";

export default function EditBookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, role, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ boothType: "small", amount: 1 });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (authLoading) return;
      setLoading(true);
      if (!id) {
        setError("Missing booking id.");
        setLoading(false);
        return;
      }
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const res = await api.getBooking(token, id);
        const bk = res?.data || res;
        const next = bk?.data || bk;
        if (mounted && next) {
          setData(next);
          setForm({ boothType: next.boothType, amount: next.amount });
          setError(null);
        } else if (mounted) {
          setError("Booking not found");
        }
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load booking");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [token, id, authLoading, router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await api.updateBooking(token, id, { boothType: form.boothType, amount: Number(form.amount) });
      try { window.dispatchEvent(new CustomEvent('bookings:changed')); } catch (e) {}
      try { localStorage.setItem('bookings:changed', Date.now().toString()); } catch (e) {}
      router.push(role === "admin" ? "/admin/bookings" : "/bookings");
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <Protected>
      <div className="page-shell" style={{ paddingTop: 12 }}>
        <Link href={role === "admin" ? "/admin/bookings" : "/bookings"} className="muted" style={{ marginBottom: 8, display: "inline-flex" }}>
          ← Back to bookings
        </Link>

        {(authLoading || loading) && <div className="panel">Loading...</div>}

        {!loading && error && !data && (
          <div className="panel" style={{ maxWidth: 640 }}>
            <div className="error" style={{ marginBottom: 8 }}>{String(error)}</div>
            <button className="btn" onClick={() => router.push(role === "admin" ? "/admin/bookings" : "/bookings")}>Back to bookings</button>
          </div>
        )}

        {!loading && data && (
          <div className="card col" style={{ gap: 14, maxWidth: 640, display : "center" }}>
            <h2 style={{ margin: 0 }}>Edit Booking</h2>
            <div className="panel" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="muted" style={{ fontSize: "0.9rem" }}>Exhibition</div>
              <div>{data.exhibition?.name}</div>
              {data.user?.name && (
                <div className="muted" style={{ fontSize: "0.9rem" }}>
                  User: {data.user.name} {data.user.email ? `(${data.user.email})` : ""}
                </div>
              )}
            </div>

            <form onSubmit={onSubmit} className="col" style={{gap: 12}}>
              <div className="form-split">
                <div className="field">
                  <label htmlFor="boothType">Booth Type</label>
                  <select id="boothType" value={form.boothType} onChange={e=>setForm({...form, boothType:e.target.value})}>
                    <option value="small">Small</option>
                    <option value="big">Big</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="amount">Amount</label>
                  <input
                    id="amount"
                    type="number"
                    min = {1}
                    max = {6}
                    value={form.amount}
                    onChange={e=>setForm({...form, amount:e.target.value})}
                  />
                  {/* <small className="muted">Specify any amount</small> */}
                </div>
              </div>
              {error && (
                <div className="panel" style={{ borderColor: "#c64747", color: "#fca5a5", background: "#1b0f10" }}>
                  {String(error)}
                </div>
              )}
              <div className="pill-actions" style={{ justifyContent: "space-between" }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => router.push(role === "admin" ? "/admin/bookings" : "/bookings")}
                  style={{ background: "transparent" }}
                >
                  Cancel
                </button>
                <button className="btn" style={{ backgroundColor: "#2563eb", borderColor: "#1d4ed8", color: "#fff" }} disabled={busy}>
                  {busy?"Saving...":"Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {!loading && !error && !data && <div className="panel">Booking not found</div>}
      </div>
    </Protected>
  );
}
