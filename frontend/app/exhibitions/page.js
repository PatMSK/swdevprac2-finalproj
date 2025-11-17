"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";

export default function ExhibitionsPage() {
  const { role } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [startAfter, setStartAfter] = useState("");
  const [sort, setSort] = useState("startAsc");

  useEffect(() => {
    let mounted = true;
    api.getExhibitions()
      .then(res => {
        const data = res?.data || res;
        if (mounted) setItems(Array.isArray(data) ? data : data?.data || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    return items
      .filter(ex => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (ex.name || '').toLowerCase().includes(s) || (ex.venue || '').toLowerCase().includes(s);
      })
      .filter(ex => {
        if (!startAfter) return true;
        try {
          const exDate = new Date(ex.startDate);
          const after = new Date(startAfter);
          return exDate >= after;
        } catch { return true; }
      })
      .sort((a,b) => {
        if (sort === 'startAsc') return new Date(a.startDate) - new Date(b.startDate);
        if (sort === 'startDesc') return new Date(b.startDate) - new Date(a.startDate);
        if (sort === 'nameAsc') return (a.name || '').localeCompare(b.name || '');
        return 0;
      });
  }, [items, search, startAfter, sort]);

  const upcomingCount = items.filter(ex => new Date(ex.startDate) >= new Date()).length;

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ marginBottom: 8 }}>Exhibitions</h2>
            <p className="muted" style={{ margin: 0 }}>
              Discover upcoming exhibitions and reserve your booth instantly.
            </p>
          </div>
          {role === "admin" && <Link className="btn btn-ghost" href="/admin/exhibitions">Admin manage</Link>}
        </div>
        <div className="section-grid" style={{ marginTop: 12 }}>
          <div className="stat-card">
            <div className="muted">Total exhibitions</div>
            <strong>{items.length}</strong>
          </div>
          <div className="stat-card">
            <div className="muted">Upcoming</div>
            <strong>{upcomingCount}</strong>
          </div>
        </div>
      </section>

      <div className="card">
        <div className="filter-bar" style={{ gap: 12 }}>
          <input
            className="filter-input"
            aria-label="search"
            placeholder="Search by name or venue"
            value={search}
            onChange={e=>setSearch(e.target.value)}
          />
          <div className="filter-group">
            <label className="muted">Start after</label>
            <input className="filter-select" type="date" value={startAfter} onChange={e=>setStartAfter(e.target.value)} />
          </div>
          <div className="filter-group">
            <label className="muted">Sort</label>
            <select className="filter-select" value={sort} onChange={e=>setSort(e.target.value)}>
              <option value="startAsc">Start date ↑</option>
              <option value="startDesc">Start date ↓</option>
              <option value="nameAsc">Name A→Z</option>
            </select>
          </div>
          <button className="btn" onClick={()=>{ setSearch(''); setStartAfter(''); setSort('startAsc'); }}>Reset</button>
        </div>
      </div>

      {loading && <div className="card">Loading exhibitions...</div>}
      {error && <div className="error">{error}</div>}

      <div className="section-grid">
        {filtered.map((ex) => (
          <div key={ex._id} className="card col" style={{ gap: 10 }}>
            <div className="card-header">
              <div>
                <h3 style={{ margin: 0 }}>{ex.name}</h3>
                <div className="card-subtitle">{ex.venue}</div>
              </div>
              <span className="badge tag-muted">{new Date(ex.startDate).toLocaleDateString()}</span>
            </div>
            <div className="muted">Duration: {ex.durationDay} day(s)</div>
            <p style={{ minHeight: 40 }}>{ex.description}</p>
            <div className="pill-actions" style={{ justifyContent: "space-between" }}>
              <div className="badge">Small: {ex.smallBoothQuota} · Big: {ex.bigBoothQuota}</div>
              <Link className="btn cta-primary" href={`/exhibitions/${ex._id}`}>View details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
