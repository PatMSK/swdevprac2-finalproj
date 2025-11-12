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
    <Protected role={"member"}>
      <div className="col" style={{gap: 16}}>
        <h2>My Bookings</h2>
        {loading && <div className="panel">Loading...</div>}
        {error && <div className="error">{error}</div>}
        <div className="panel">
          <table className="table">
            <thead>
              <tr>
                <th>Exhibition</th>
                <th>Booth Type</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(b => (
                <tr key={b._id}>
                  <td>{b.exhibition?.name}</td>
                  <td>{b.boothType}</td>
                  <td>{b.amount}</td>
                  <td>
                    <Link className="btn" href={`/bookings/${b._id}`}>Edit</Link>
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

