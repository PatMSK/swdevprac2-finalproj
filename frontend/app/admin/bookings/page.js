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
      <div className="col" style={{gap: 16}}>
        <h2>Admin: Bookings</h2>
        {loading && <div className="panel">Loading...</div>}
        {error && <div className="error">{error}</div>}
        <div className="panel">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Exhibition</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(b => (
                <tr key={b._id}>
                  <td>{b.user?.name} ({b.user?.email})</td>
                  <td>{b.exhibition?.name}</td>
                  <td>{b.boothType}</td>
                  <td>{b.amount}</td>
                  <td>
                    <a className="btn" href={`/bookings/${b._id}`}>Edit</a>
                    <button className="btn btn-danger" onClick={() => remove(b._id)} style={{marginLeft: 8}}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Protected>
  );
}

