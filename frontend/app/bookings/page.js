"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Protected from "../../components/Protected";
import { useAuth } from "../../lib/AuthContext";
import { api } from "../../lib/api";

export default function MyBookingsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!token) return;
    api.getBookings(token)
      .then(res => {
        const data = res?.data || res;
        if (mounted) setItems(Array.isArray(data) ? data : data?.data || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [token]);

  const remove = async (id) => {
    if (!confirm("Delete this booking?")) return;
    try {
      await api.deleteBooking(token, id);
      setItems(items.filter(b => b._id !== id));
    } catch (err) { alert(err.message); }
  };

  return (
    <Protected>
      <div className="page-shell">
        <section className="page-hero">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ marginBottom: 6 }}>My Bookings</h2>
              <p className="muted" style={{ margin: 0 }}>Track and manage your booth reservations.</p>
            </div>
          </div>
          <div className="section-grid" style={{ marginTop: 12 }}>
            <div className="stat-card">
              <div className="muted">Active bookings</div>
              <strong>{items.length}</strong>
            </div>
          </div>
        </section>

        {loading && <div className="card">Loading...</div>}
        {error && <div className="error">{error}</div>}

        <div className="card table-card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Exhibition</th>
                  <th>Booth Type</th>
                  <th>Amount</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(b => (
                  <tr key={b._id}>
                    <td>{b.exhibition?.name}</td>
                    <td>{b.boothType}</td>
                    <td>{b.amount}</td>
                    <td style={{ textAlign: "right" }}>
                      <div className="table-actions">
                        <Link className="btn btn-edit" href={`/bookings/${b._id}`}>
                          <span aria-hidden>✎</span>
                          Edit
                        </Link>
                        <button className="btn btn-delete" onClick={() => remove(b._id)}>🗑 Delete</button>
                      </div>
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
