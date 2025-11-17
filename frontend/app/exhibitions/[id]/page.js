"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/AuthContext";

export default function ExhibitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, role } = useAuth();
  const id = params?.id;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ boothType: "small", amount: 1 });
  const [busy, setBusy] = useState(false);

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
    if (!token) { router.push("/login"); return; }
    setBusy(true); setError(null);
    try {
      await api.createBooking(token, { exhibition: id, boothType: booking.boothType, amount: Number(booking.amount) });
      router.push("/bookings");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="panel">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!data) return <div className="panel">Not found</div>;

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ marginBottom: 6 }}>{data.name}</h2>
            <p className="muted" style={{ margin: 0 }}>{data.venue}</p>
          </div>
          <span className="badge tag-muted">{new Date(data.startDate).toLocaleDateString()}</span>
        </div>
        <div className="section-grid" style={{ marginTop: 12 }}>
          <div className="stat-card">
            <div className="muted">Duration</div>
            <strong>{data.durationDay} day(s)</strong>
          </div>
          <div className="stat-card">
            <div className="muted">Small booths</div>
            <strong>{data.smallBoothQuota}</strong>
          </div>
          <div className="stat-card">
            <div className="muted">Big booths</div>
            <strong>{data.bigBoothQuota}</strong>
          </div>
        </div>
      </section>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>About this exhibition</h3>
        <p style={{ marginBottom: 0 }}>{data.description}</p>
      </div>

      {role === "member" && (
        <form onSubmit={submitBooking} className="card col" style={{ gap: 12 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Create booking</h3>
              <p className="card-subtitle">Choose your booth type and amount.</p>
            </div>
          </div>
          <div className="form-split">
            <div className="field">
              <label>Booth Type</label>
              <select value={booking.boothType} onChange={e=>setBooking({...booking, boothType:e.target.value})}>
                <option value="small">small</option>
                <option value="big">big</option>
              </select>
            </div>
            <div className="field">
              <label>Amount</label>
              <input type="number" min={1} value={booking.amount} onChange={e=>setBooking({...booking, amount:e.target.value})} />
            </div>
          </div>
          {error && <div className="error">{error}</div>}
          <div className="pill-actions" style={{ justifyContent: "flex-end" }}>
            <button className="btn cta-primary" disabled={busy}>{busy?"Submitting...":"Create booking"}</button>
          </div>
        </form>
      )}
    </div>
  );
}
