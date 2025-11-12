"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register, setError, error } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", tel: "", role: "member", password: "" });
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(form);
      router.push("/exhibitions");
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="panel" style={{maxWidth: 640, margin: "24px auto"}}>
      <h2>Register</h2>
      <form className="grid" onSubmit={onSubmit}>
        <div className="field">
          <label>Name</label>
          <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
        </div>
        <div className="field">
          <label>Tel</label>
          <input value={form.tel} onChange={e=>setForm({...form, tel:e.target.value})} required />
        </div>
        <div className="field">
          <label>Role</label>
          <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
            <option value="member">member</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />
        </div>
        {error && <div className="error" style={{gridColumn: "1/-1"}}>{String(error)}</div>}
        <div style={{gridColumn: "1/-1"}}>
          <button className="btn btn-accent" disabled={busy}>{busy?"Registering...":"Register"}</button>
        </div>
      </form>
    </div>
  );
}

