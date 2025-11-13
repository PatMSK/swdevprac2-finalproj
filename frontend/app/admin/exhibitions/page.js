"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Protected from "../../../components/Protected";
import { useAuth } from "../../../lib/AuthContext";
import { api } from "../../../lib/api";

export default function AdminExhibitionsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    venue: "",
    startDate: "",
    durationDay: 1,
    smallBoothQuota: 0,
    bigBoothQuota: 0,
    posterPicture: ""
  });
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    api.getExhibitions()
      .then(res => {
        const data = res?.data || res;
        setItems(Array.isArray(data) ? data : data?.data || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await api.createExhibition(token, {
        ...form,
        durationDay: Number(form.durationDay),
        smallBoothQuota: Number(form.smallBoothQuota),
        bigBoothQuota: Number(form.bigBoothQuota)
      });
      setForm({ name: "", description: "", venue: "", startDate: "", durationDay: 1, smallBoothQuota: 0, bigBoothQuota: 0, posterPicture: "" });
      load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this exhibition?")) return;
    try { await api.deleteExhibition(token, id); load(); } catch (err) { alert(err.message); }
  };

  return (
    <Protected role={"admin"}>
      <div className="col" style={{gap: 16}}>
        <h2>Admin: Exhibitions</h2>
        {loading && <div className="panel">Loading...</div>}
        {error && <div className="error">{error}</div>}

        <form className="panel grid" onSubmit={create}>
          <h3 style={{gridColumn: "1/-1"}}>Create Exhibition</h3>
          <div className="field"><label>Name</label><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required /></div>
          <div className="field"><label>Venue</label><input value={form.venue} onChange={e=>setForm({...form, venue:e.target.value})} required /></div>
          <div className="field" style={{gridColumn: "1/-1"}}><label>Description</label><textarea rows={3} value={form.description} onChange={e=>setForm({...form, description:e.target.value})} required /></div>
          <div className="field"><label>Start Date</label><input type="date" value={form.startDate} onChange={e=>setForm({...form, startDate:e.target.value})} required /></div>
          <div className="field"><label>Duration (days)</label><input type="number" min={1} value={form.durationDay} onChange={e=>setForm({...form, durationDay:e.target.value})} /></div>
          <div className="field"><label>Small Booth Quota</label><input type="number" min={0} value={form.smallBoothQuota} onChange={e=>setForm({...form, smallBoothQuota:e.target.value})} /></div>
          <div className="field"><label>Big Booth Quota</label><input type="number" min={0} value={form.bigBoothQuota} onChange={e=>setForm({...form, bigBoothQuota:e.target.value})} /></div>
          <div className="field" style={{gridColumn: "1/-1"}}><label>Poster Picture URL</label><input value={form.posterPicture} onChange={e=>setForm({...form, posterPicture:e.target.value})} /></div>
          <div style={{gridColumn: "1/-1"}}><button className="btn btn-accent" disabled={busy}>{busy?"Creating...":"Create"}</button></div>
        </form>

        <div className="panel">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Venue</th>
                  <th>Start</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(ex => (
                  <tr key={ex._id}>
                    <td>{ex.name}</td>
                    <td>{ex.venue}</td>
                    <td>{new Date(ex.startDate).toLocaleDateString()}</td>
                    <td>
                      <Link className="btn" href={`/admin/exhibitions/${ex._id}`}>Edit</Link>
                      <button className="btn btn-danger" onClick={() => remove(ex._id)} style={{marginLeft: 8}}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Protected>
  );
}
