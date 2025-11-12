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
    <div className="col" style={{gap: 16}}>
      <div className="panel col">
        <h2>{data.name}</h2>
        <div className="muted">{data.venue}</div>
        <div className="muted">Start: {new Date(data.startDate).toLocaleDateString()} · {data.durationDay} day(s)</div>
        <p>{data.description}</p>
        <div className="row" style={{gap: 24}}>
          <div>Small quota: {data.smallBoothQuota}</div>
          <div>Big quota: {data.bigBoothQuota}</div>
        </div>
      </div>

      {role === "member" && (
        <form onSubmit={submitBooking} className="panel col" style={{gap: 12}}>
          <h3>Create Booking</h3>
          <div className="row" style={{gap: 16}}>
            <div className="field" style={{minWidth: 180}}>
              <label>Booth Type</label>
              <select value={booking.boothType} onChange={e=>setBooking({...booking, boothType:e.target.value})}>
                <option value="small">small</option>
                <option value="big">big</option>
              </select>
            </div>
            <div className="field" style={{minWidth: 180}}>
              <label>Amount</label>
              <input type="number" min={1} value={booking.amount} onChange={e=>setBooking({...booking, amount:e.target.value})} />
            </div>
          </div>
          {error && <div className="error">{error}</div>}
          <div>
            <button className="btn btn-accent" disabled={busy}>{busy?"Submitting...":"Create Booking"}</button>
          </div>
        </form>
      )}
    </div>
  );
}

