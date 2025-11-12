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
      <div className="row" style={{justifyContent: "space-between"}}>
        <h2>Exhibitions</h2>
        {role === "admin" && <Link className="btn" href="/admin/exhibitions">Admin Manage</Link>}
      </div>
      {loading && <div className="panel">Loading exhibitions...</div>}
      {error && <div className="error">{error}</div>}
      <div className="grid">
        {items.map((ex) => (
          <div key={ex._id} className="panel col">
            <h3>{ex.name}</h3>
            <div className="muted">{ex.venue}</div>
            <div className="muted">Start: {new Date(ex.startDate).toLocaleDateString()} · {ex.durationDay} day(s)</div>
            <p style={{minHeight: 40}}>{ex.description}</p>
            <Link className="btn btn-accent" href={`/exhibitions/${ex._id}`}>View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

