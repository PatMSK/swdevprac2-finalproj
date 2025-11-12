"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
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

  return (
    <div className="col" style={{gap: 16}}>
      <div className="row" style={{justifyContent: "space-between", alignItems: 'center'}}>
        <h2>Exhibitions</h2>
        {role === "admin" && <Link className="btn" href="/admin/exhibitions">Admin Manage</Link>}
      </div>

      {/* Search & filters */}
      <div className="panel row filter-bar" style={{gap: 12}}>
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
      {loading && <div className="panel">Loading exhibitions...</div>}
      {error && <div className="error">{error}</div>}
      <div className="grid">
        {
          // apply client-side search + filters
          items
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
            })
            .map((ex) => (
          <div key={ex._id} className="panel col">
            <h3>{ex.name}</h3>
            <div className="muted">{ex.venue}</div>
            <div className="muted">Start: {new Date(ex.startDate).toLocaleDateString()} · {ex.durationDay} day(s)</div>
            <p style={{minHeight: 40}}>{ex.description}</p>
            <Link className="btn btn-accent" href={`/exhibitions/${ex._id}`}>View Details</Link>
          </div>
            ))
        }
      </div>
    </div>
  );
}

