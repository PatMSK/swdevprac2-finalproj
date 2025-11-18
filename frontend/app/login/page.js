"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, setError, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      router.push("/exhibitions");
    } catch (err) {
      setError("Invalid email or password");
    } finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 4rem)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
      <div className="card" style={{ width: "100%", maxWidth: 540 }}>
        <h2 style={{ textAlign: "center", marginBottom: 18 }}>Login</h2>

        {error && (
          <div className="panel" style={{ borderColor: "#dc2626", color: "#dc2626", background: "#fef2f2", marginBottom: 12 }}>
            {String(error)}
          </div>
        )}

        <form className="col" style={{ gap: 14 }} onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Enter your password" />
          </div>
          <button
            className="btn"
            style={{ backgroundColor: "#2563eb", borderColor: "#1d4ed8", color: "#fff"}}
            disabled={busy}
          >
            {busy ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Link href="/exhibitions" className="muted">← Back to exhibitions</Link>
        </div>

        {/* <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)", textAlign: "center", color: "var(--muted)", fontSize: "0.9rem" }}>
          <p style={{ margin: 0 }}>Test accounts:</p>
          <p style={{ margin: "4px 0" }}>Admin: admin@test.com</p>
          <p style={{ margin: 0 }}>Member: member@test.com</p>
          <p style={{ margin: "8px 0 0", fontSize: "0.8rem" }}>(Any password works for demo)</p>
        </div> */}
      </div>
    </div>
  );
}
