"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/AuthContext";

export default function ExhibitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, role, user } = useAuth();
  const id = params?.id;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingsSmall, setBookingsSmall] = useState(null);
  const [bookingsBig, setBookingsBig] = useState(null);
  const [booking, setBooking] = useState({ boothType: "small", amount: 1 });
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.getExhibition(id);
        const ex = res?.data || res;
        if (mounted) setData(ex?.data || ex);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    const onVisibility = () => {
      if (document.visibilityState === "visible") load();
    };
    const onFocus = () => { load(); };
    const onBookingsChanged = () => { load(); };

    const onStorage = (e) => {
      if (e.key === 'bookings:changed') load();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("bookings:changed", onBookingsChanged);
    window.addEventListener("storage", onStorage);

    return () => { mounted = false; document.removeEventListener("visibilitychange", onVisibility); window.removeEventListener("focus", onFocus); window.removeEventListener("bookings:changed", onBookingsChanged); window.removeEventListener("storage", onStorage); };
  }, [id]);

  // load bookings for this exhibition when we have a token (to compute accurate availability)
  useEffect(() => {
    let mounted = true;
    const loadBookings = async () => {
      if (!id || !token) return;
      try {
        const res = await api.getBookings(token);
        const list = (res?.data || res) || [];
        const my = Array.isArray(list) ? list : (list?.data || []);
        if (!mounted) return;
        const filtered = my.filter(b => (b.exhibition && ((b.exhibition._id && b.exhibition._id === id) || (b.exhibition === id) )));
        const small = filtered.filter(b => b.boothType === "small").reduce((s, b) => s + (Number(b.amount) || 0), 0);
        const big = filtered.filter(b => b.boothType === "big").reduce((s, b) => s + (Number(b.amount) || 0), 0);
        setBookingsSmall(small);
        setBookingsBig(big);
      } catch (err) {
        // ignore — we'll fall back to server-provided counts
      }
    };

    loadBookings();
    const onBookingsChangedLocal = () => loadBookings();
    window.addEventListener("bookings:changed", onBookingsChangedLocal);
    return () => { mounted = false; window.removeEventListener("bookings:changed", onBookingsChangedLocal); };
  }, [id, token]);

  const submitBooking = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!token) { router.push("/login"); return; }
    setBusy(true);
    try {
      await api.createBooking(token, { exhibition: id, boothType: booking.boothType, amount: Number(booking.amount) });
      setSuccess(true);
      try { window.dispatchEvent(new CustomEvent('bookings:changed')); } catch (e) {}
      setTimeout(() => router.push(role === "admin" ? "/admin/bookings" : "/bookings"), 1200);
    } catch (err) {
      // For admins, do not attempt any client-side fallback — surface a clear error.
      if (role === "admin") {
        const message = (err && err.status === 403)
          ? "Admin is not authorized to create booking."
          : (err?.message || "Admin cannot create bookings.");
        setError(message);
        console.warn('createBooking admin error', err);
        setBusy(false);
        return;
      }
      // For non-admins, show the error returned from the server.
      setError(err?.message || String(err));
    } finally { setBusy(false); }
  };


  if (loading) return <div className="panel">Loading...</div>;

  // Compute available booths if the API returns taken counts; otherwise fall back to quota
  const smallTaken = data?.smallBoothTaken ?? data?.smallBoothBooked ?? data?.smallBooked ?? 0;
  const bigTaken = data?.bigBoothTaken ?? data?.bigBoothBooked ?? data?.bigBooked ?? 0;
  const smallAvailable = Math.max((data?.smallBoothQuota || 0) - smallTaken, 0);
  const bigAvailable = Math.max((data?.bigBoothQuota || 0) - bigTaken, 0);

  return (
    <div className="page-shell">
      {/* {error && (
        <div className="panel" style={{ borderColor: "#c64747", color: "#fca5a5", background: "#1b0f10", marginBottom: 10 }}>
          {error}
        </div>
      )} */}
      {!data && !error && <div className="panel">Not found</div>}
      {data && (
        <>
          <Link href="/exhibitions" className="muted" style={{ marginBottom: 8, display: "inline-flex" }}>
            ← Back to exhibitions
          </Link>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ position: "relative", paddingTop: "42%", background: "var(--panel)" }}>
              {data.posterPicture && (
                <img
                  src={data.posterPicture}
                  alt={data.name}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              )}
            </div>
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <h2 style={{ margin: 0 }}>{data.name}</h2>
              <div className="muted" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <svg className="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s8-5.333 8-11a8 8 0 10-16 0c0 5.667 8 11 8 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                <span>{data.venue}</span>
              </div>
              <div className="muted" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  <svg className="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  Starts: {new Date(data.startDate).toLocaleDateString()}
                </span>
                <span style={{ margin: "0 6px" }}>•</span>
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  <svg className="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  Duration: {data.durationDay} day(s)
                </span>
              </div>
              <p className="muted" style={{ margin: "4px 0 0 0", lineHeight: 1.6 }}>{data.description}</p>

              <div className="section-grid" style={{ marginTop: 10 }}>
                <div className="stat-card">
                  <div className="muted" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div>Small booths</div>
                  </div>
                  <strong>Available: {smallAvailable}/{data.smallBoothQuota || 0}</strong>
                </div>
                <div className="stat-card">
                  <div className="muted" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div>Big booths</div>
                  </div>
                  <strong>Available: {bigAvailable}/{data.bigBoothQuota || 0}</strong>
                </div>
              </div>
            </div>
          </div>

          {role === "member" || role === "admin" ? (
            <div className="card col" style={{ gap: 14 }}>
              <h3 style={{ margin: 0 }}>Create booking</h3>
              <p className="muted" style={{ margin: "0 0 6px 0" }}>Choose booth type and amount</p>
              {success && <div className="success">Booking created! Redirecting...</div>}
              {error && (
                <div className="panel" style={{ borderColor: "var(--danger)", color: "var(--danger)", background: "var(--panel)" }}>
                  {error}
                </div>
              )}
              <form onSubmit={submitBooking} className="col" style={{ gap: 12 }}>
                <div className="form-split">
                <div className="field">
                  <label>Booth Type</label>
                  <select value={booking.boothType} onChange={e=>setBooking({...booking, boothType:e.target.value})}>
                    <option value="small">Small</option>
                    <option value="big">Big</option>
                  </select>
                  </div>
                  <div className="field">
                    <label>Amount</label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={booking.amount}
                      onChange={e=>setBooking({...booking, amount:e.target.value})}
                    />
                  </div>
                </div>
                <button className="btn" style={{ backgroundColor: "#2563eb", borderColor: "#1d4ed8", color: "#fff"}} disabled={busy}>
                  {busy ? "Creating..." : "Create Booking"}
                </button>
              </form>
            </div>
          ) : !user ? (
            <div className="card col" style={{ gap: 10, textAlign: "center" }}>
              <h3 style={{ margin: 0 }}>Login required</h3>
              <p className="muted" style={{ margin: "0 0 8px 0" }}>
                Please log in to create a booking for this exhibition.
              </p>
              <div className="pill-actions" style={{ justifyContent: "center" }}>
                <Link className="btn" style={{ backgroundColor: "#2563eb", borderColor: "#1d4ed8", color: "#fff"}} href="/login">Go to Login</Link>
                <Link className="btn" href="/register">Create account</Link>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
