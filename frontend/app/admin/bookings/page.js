"use client";
import { useEffect, useState } from "react";
import Protected from "../../../components/Protected";
import { useAuth } from "../../../lib/AuthContext";
import { api } from "../../../lib/api";

export default function AdminBookingsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.getBookings(token)
      .then(res => {
        const data = res?.data || res;
        setItems(Array.isArray(data) ? data : data?.data || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (token) load(); }, [token]);

  const remove = async (id) => {
    if (!confirm("Delete this booking?")) return;
    try { await api.deleteBooking(token, id); load(); } catch (err) { alert(err.message); }
  };

  return (
    <Protected role={"admin"}>
      <div className="page-shell">
        <section className="page-hero">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ marginBottom: 6 }}>Admin: Bookings</h2>
              <p className="muted" style={{ margin: 0 }}>Audit and manage all booth reservations.</p>
            </div>
            <div className="badge">Total: {items.length}</div>
          </div>
        </section>
        {loading && <div className="card">Loading...</div>}
        {error && <div className="error">{error}</div>}
        <div className="card table-card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Exhibition</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(b => (
                  <tr key={b._id}>
                    <td>{b.user?.name} ({b.user?.email})</td>
                    <td>{b.exhibition?.name}</td>
                    <td>{b.boothType}</td>
                    <td>{b.amount}</td>
                    <td style={{ textAlign: "right" }}>
                      <div className="table-actions">
                        <a className="btn btn-edit" href={`/bookings/${b._id}`}>
                          <span aria-hidden>✎</span>
                          Edit
                        </a>
                        <button className="btn btn-delete" onClick={() => remove(b._id)}>
                          <span aria-hidden>🗑</span>
                          Delete
                        </button>
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
