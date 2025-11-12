"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Protected from "../../../components/Protected";
import { useAuth } from "../../../lib/AuthContext";
import { api } from "../../../lib/api";

export default function EditBookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ boothType: "small", amount: 1 });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!token || !id) return;
    api.getBooking(token, id)
      .then(res => {
        const bk = res?.data || res;
        const data = bk?.data || bk;
        if (mounted) {
          setData(data);
          setForm({ boothType: data.boothType, amount: data.amount });
        }
      })
      .catch(err => setError(err.message));
    return () => { mounted = false; };
  }, [token, id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await api.updateBooking(token, id, { boothType: form.boothType, amount: Number(form.amount) });
      router.push("/bookings");
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  if (!data) return (
    <Protected>
      <div className="panel">Loading...</div>
    </Protected>
  );

  return (
    <Protected>
      <div className="panel col" style={{gap: 12, maxWidth: 520}}>
        <h2>Edit Booking</h2>
        <div className="muted">Exhibition: {data.exhibition?.name}</div>
        <form onSubmit={onSubmit} className="col" style={{gap: 12}}>
          <div className="field">
            <label>Booth Type</label>
            <select value={form.boothType} onChange={e=>setForm({...form, boothType:e.target.value})}>
              <option value="small">small</option>
              <option value="big">big</option>
            </select>
          </div>
          <div className="field">
            <label>Amount</label>
            <input type="number" min={1} value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} />
          </div>
          {error && <div className="error">{error}</div>}
          <button className="btn btn-accent" disabled={busy}>{busy?"Saving...":"Save"}</button>
        </form>
      </div>
    </Protected>
  );
}

