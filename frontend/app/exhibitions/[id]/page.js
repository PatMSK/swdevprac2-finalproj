"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/AuthContext";

export default function ExhibitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, role, user } = useAuth();
  const id = params?.id;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ boothType: "small", amount: 1 });
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    api.getExhibition(id)
      .then(res => {
        const ex = res?.data || res;
        if (mounted) setData(ex?.data || ex);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [id]);

  const submitBooking = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!token) { router.push("/login"); return; }
    setBusy(true);
    try {
      await api.createBooking(token, { exhibition: id, boothType: booking.boothType, amount: Number(booking.amount) });
      setSuccess(true);
      setTimeout(() => router.push("/bookings"), 1200);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="panel">Loading...</div>;

  return (
    <div className="page-shell">
      {/* {error && (
        <div className="panel" style={{ borderColor: "#c64747", color: "#fca5a5", background: "#1b0f10", marginBottom: 10 }}>
          {error}
        </div>
      )} */}
      {!data && !error && <div className="panel">Not found</div>}
      {data && (
        <>
          <Link href="/exhibitions" className="muted" style={{ marginBottom: 8, display: "inline-flex" }}>
            ← Back to exhibitions
          </Link>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ position: "relative", paddingTop: "42%", background: "#0f172a" }}>
              {data.posterPicture && (
                <img
                  src={data.posterPicture}
                  alt={data.name}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              )}
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <h2 style={{ margin: 0 }}>{data.name}</h2>
              <div className="muted">{data.venue}</div>
              <div className="muted" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span>Starts: {new Date(data.startDate).toLocaleDateString()}</span>
                <span>• Duration: {data.durationDay} day(s)</span>
              </div>
              <p className="muted" style={{ margin: "4px 0 0 0", lineHeight: 1.6 }}>{data.description}</p>

              <div className="section-grid" style={{ marginTop: 10 }}>
                <div className="stat-card">
                  <div className="muted">Small booths</div>
                  <strong>{data.smallBoothQuota}</strong>
                </div>
                <div className="stat-card">
                  <div className="muted">Big booths</div>
                  <strong>{data.bigBoothQuota}</strong>
                </div>
              </div>
            </div>
          </div>

          {role === "member" || role === "admin" ? (
            <div className="card col" style={{ gap: 14 }}>
              <h3 style={{ margin: 0 }}>Create booking</h3>
              <p className="muted" style={{ margin: "0 0 6px 0" }}>Choose booth type and amount</p>
              {success && <div className="success">Booking created! Redirecting...</div>}
              {error && (
                <div className="panel" style={{ borderColor: "#c64747", color: "#fca5a5", background: "#1b0f10" }}>
                  {error}
                </div>
              )}
              <form onSubmit={submitBooking} className="col" style={{ gap: 12 }}>
                <div className="form-split">
                <div className="field">
                  <label>Booth Type</label>
                  <select value={booking.boothType} onChange={e=>setBooking({...booking, boothType:e.target.value})}>
                    <option value="small">Small</option>
                    <option value="big">Big</option>
                  </select>
                  </div>
                  <div className="field">
                    <label>Amount</label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={booking.amount}
                      onChange={e=>setBooking({...booking, amount:e.target.value})}
                    />
                  </div>
                </div>
                <button className="btn" style={{ backgroundColor: "#2563eb", borderColor: "#1d4ed8", color: "#fff"}} disabled={busy}>
                  {busy ? "Creating..." : "Create Booking"}
                </button>
              </form>
            </div>
          ) : !user ? (
            <div className="card col" style={{ gap: 10, textAlign: "center" }}>
              <h3 style={{ margin: 0 }}>Login required</h3>
              <p className="muted" style={{ margin: "0 0 8px 0" }}>
                Please log in to create a booking for this exhibition.
              </p>
              <div className="pill-actions" style={{ justifyContent: "center" }}>
                <Link className="btn" style={{ backgroundColor: "#2563eb", borderColor: "#1d4ed8", color: "#fff"}} href="/login">Go to Login</Link>
                <Link className="btn" href="/register">Create account</Link>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
