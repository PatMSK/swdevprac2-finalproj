"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Protected from "../../../../components/Protected";
import { useAuth } from "../../../../lib/AuthContext";
import { api } from "../../../../lib/api";

export default function AdminEditExhibitionPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    api.getExhibition(id)
      .then(res => {
        const ex = res?.data || res; const data = ex?.data || ex;
        if (mounted) setForm({
          name: data.name || "",
          description: data.description || "",
          venue: data.venue || "",
          startDate: data.startDate ? new Date(data.startDate).toISOString().slice(0,10) : "",
          durationDay: data.durationDay || 1,
          smallBoothQuota: data.smallBoothQuota || 0,
          bigBoothQuota: data.bigBoothQuota || 0,
          posterPicture: data.posterPicture || ""
        });
      })
      .catch(err => setError(err.message));
    return () => { mounted = false; };
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await api.updateExhibition(token, id, {
        ...form,
        durationDay: Number(form.durationDay),
        smallBoothQuota: Number(form.smallBoothQuota),
        bigBoothQuota: Number(form.bigBoothQuota)
      });
      router.push("/admin/exhibitions");
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  if (!form) return (
    <Protected role={"admin"}>
      <div className="panel">Loading...</div>
    </Protected>
  );

  return (
    <Protected role={"admin"}>
      <div className="page-shell" style={{ paddingTop: 12 }}>
        <form className="card col" style={{ gap: 12 }} onSubmit={onSubmit}>
          <div className="card-header">
            <div>
              <h2 style={{ margin: 0 }}>Edit exhibition</h2>
              <p className="card-subtitle">Update timing, quotas, and description.</p>
            </div>
          </div>
          <div className="form-split">
            <div className="field"><label>Name</label><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required /></div>
            <div className="field"><label>Venue</label><input value={form.venue} onChange={e=>setForm({...form, venue:e.target.value})} required /></div>
          </div>
          <div className="field"><label>Description</label><textarea rows={3} value={form.description} onChange={e=>setForm({...form, description:e.target.value})} required /></div>
          <div className="form-split">
            <div className="field"><label>Start Date</label><input type="date" value={form.startDate} onChange={e=>setForm({...form, startDate:e.target.value})} required /></div>
            <div className="field"><label>Duration (days)</label><input type="number" min={1} value={form.durationDay} onChange={e=>setForm({...form, durationDay:e.target.value})} /></div>
          </div>
          <div className="form-split">
            <div className="field"><label>Small Booth Quota</label><input type="number" min={0} value={form.smallBoothQuota} onChange={e=>setForm({...form, smallBoothQuota:e.target.value})} /></div>
            <div className="field"><label>Big Booth Quota</label><input type="number" min={0} value={form.bigBoothQuota} onChange={e=>setForm({...form, bigBoothQuota:e.target.value})} /></div>
          </div>
          <div className="field"><label>Poster Picture URL</label><input value={form.posterPicture} onChange={e=>setForm({...form, posterPicture:e.target.value})} /></div>
          {error && <div className="error">{error}</div>}
          <div className="pill-actions" style={{ justifyContent: "flex-end" }}><button className="btn cta-primary" disabled={busy}>{busy?"Saving...":"Save changes"}</button></div>
        </form>
      </div>
    </Protected>
  );
}
