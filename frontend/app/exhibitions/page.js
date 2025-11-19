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
  const [sort, setSort] = useState("date-asc");

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
        return (ex.name || "").toLowerCase().includes(s) || (ex.venue || "").toLowerCase().includes(s);
      })
      .filter(ex => {
        if (!startAfter) return true;
        try {
          return new Date(ex.startDate) >= new Date(startAfter);
        } catch { return true; }
      })
      .sort((a, b) => {
        if (sort === "date-asc") return new Date(a.startDate) - new Date(b.startDate);
        if (sort === "date-desc") return new Date(b.startDate) - new Date(a.startDate);
        if (sort === "name-asc") return (a.name || "").localeCompare(b.name || "");
        return 0;
      });
  }, [items, search, startAfter, sort]);

  const resetFilters = () => {
    setSearch("");
    setStartAfter("");
    setSort("date-asc");
  };

  return (
    <div className="page-shell">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h2 style={{ margin: 0 }}>Exhibitions</h2>
        {role === "admin" && (
          <Link href="/admin/exhibitions" className="btn btn-ghost" style={{ gap: 6 }}>
            Admin Panel
          </Link>
        )}
      </div>

      <div className="card">
        <div className="filter-bar" style={{ gap: 12 }}>
          <div className="col" style={{ flex: 1 }}>
            <label className="muted" style={{ fontSize: "0.9rem" }}>Search</label>
            <input
              className="filter-input"
              placeholder="Name or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col" style={{ minWidth: 180 }}>
            <label className="muted" style={{ fontSize: "0.9rem" }}>Start Date From</label>
            <input
              className="filter-select"
              type="date"
              value={startAfter}
              onChange={(e) => setStartAfter(e.target.value)}
            />
          </div>
          <div className="col" style={{ minWidth: 180 }}>
            <label className="muted" style={{ fontSize: "0.9rem" }}>Sort By</label>
            <select
              className="filter-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="date-asc">Start date ↑</option>
              <option value="date-desc">Start date ↓</option>
              <option value="name-asc">Name A-Z</option>
            </select>
          </div>
          <button className="btn" onClick={resetFilters} style={{ alignSelf: "flex-end" }}>
            Reset
          </button>
        </div>
      </div>

      {loading && <div className="card">Loading exhibitions...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="card" style={{ textAlign: "center" }}>
          <p className="muted">No exhibitions found</p>
        </div>
      )}

      <div className="section-grid">
        {filtered.map((ex) => (
          <div
            key={ex._id}
            className="card"
            style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
          >
              <div
              style={{
                position: "relative",
                paddingTop: "56%",
                background: "var(--panel)",
                overflow: "hidden"
              }}
            >
              {ex.posterPicture ? (
                <img
                  src={ex.posterPicture}
                  alt={ex.name}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : null}
            </div>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <h3 style={{ margin: "0 0 4px 0" }}>{ex.name}</h3>
              <div className="muted" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span aria-hidden>
                  <svg className="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M12 21s8-5.333 8-11a8 8 0 10-16 0c0 5.667 8 11 8 11z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </span>
                <span>{ex.venue}</span>
              </div>
              <div className="muted" style={{ display: "flex", gap: 12, alignItems: "center", fontSize: "0.95rem" }}>
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  <svg className="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  {new Date(ex.startDate).toLocaleDateString()}
                </span>
                <span style={{ margin: "0 6px" }}>•</span>
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  <svg className="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  {ex.durationDay} day(s)
                </span>
              </div>
              <p className="muted card-desc" style={{ margin: "4px 0", fontSize: "0.95rem" }}>
                {ex.description}
              </p>
              <div style={{ marginTop: "auto", width: "100%" }}>
                <Link className="btn" style={{ backgroundColor: "#2563eb", borderColor: "#1d4ed8", color: "#fff", display: "block", textAlign: "left" }} href={`/exhibitions/${ex._id}`}>
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
