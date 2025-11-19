"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";

const REQUIRED_FIELDS = ["name", "email", "tel", "password", "confirmPassword"];
const errorTextStyle = { color: "var(--danger)", fontSize: "0.9rem", marginTop: "0", marginBottom: "0" };
const submitButtonStyle = { backgroundColor: "#fcead6", color: "#030213", borderColor: "#f7c87a", width: "100%" };

const validateField = (field, value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    const requiredMessages = {
      name: "Name is required",
      email: "Email is required",
      tel: "Tel is required",
      password: "Password is required",
    };
    return requiredMessages[field] || "Required";
  }
  if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Invalid email";
  }
  if (field === "tel" && !/^\d+$/.test(trimmed)) {
    return "Telephone must be number only";
  }
  if (field === "password" && trimmed.length < 7) {
    return "Password must be more than 6 characters";
  }
  return null;
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, setError, error } = useAuth();
  // Keep role fixed to 'member' on the client — admin assignment must be done server-side by admins only
  const [form, setForm] = useState({ name: "", email: "", tel: "", role: "member", password: "", confirmPassword: "" });
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (hasSubmitted) {
      setFieldErrors((prev) => {
        const fieldError = validateField(field, value);
        const next = { ...prev };
        if (fieldError) {
          next[field] = fieldError;
        } else {
          delete next[field];
        }
        return next;
      });
    }
  };

  const validateFields = () => {
    const nextErrors = {};
    REQUIRED_FIELDS.forEach((field) => {
      const fieldError = validateField(field, form[field]);
      if (fieldError) {
        nextErrors[field] = fieldError;
      }
    });
    // Check password match
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setHasSubmitted(true);
    if (!validateFields()) {
      return;
    }
    setBusy(true);
    try {
      // Don't send confirmPassword to the API
      const payload = { ...form };
      delete payload.confirmPassword;
      await register(payload);
      router.push("/exhibitions");
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 4rem)", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
      <div className="card" style={{ width: "100%", maxWidth: 640 }}>
        <h2 style={{ textAlign: "center", marginBottom: 18 }}>Register</h2>

        {error && (
          <div className="panel" style={{ borderColor: "var(--danger)", color: "var(--danger)", background: "color-mix(in srgb, var(--danger) 8%, var(--panel))", }}>
            {String(error)}
          </div>
        )}

        <form className="col" style={{ gap: 16 }} onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" value={form.name} onChange={handleChange("name")} placeholder="Peace Peace" />
            {hasSubmitted && fieldErrors.name && <p style={errorTextStyle}>{fieldErrors.name}</p>}
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} onChange={handleChange("email")} placeholder="you@example.com" />
            {hasSubmitted && fieldErrors.email && <p style={errorTextStyle}>{fieldErrors.email}</p>}
          </div>

          <div className="field">
            <label htmlFor="tel">Telephone</label>
            <input id="tel" type="tel" value={form.tel} onChange={handleChange("tel")} placeholder="0123456789" />
            {hasSubmitted && fieldErrors.tel && <p style={errorTextStyle}>{fieldErrors.tel}</p>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={form.password} onChange={handleChange("password")} placeholder="Create a strong password" />
            {hasSubmitted && fieldErrors.password && <p style={errorTextStyle}>{fieldErrors.password}</p>}
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange("confirmPassword")} placeholder="Enter your password again" />
            {hasSubmitted && fieldErrors.confirmPassword && <p style={errorTextStyle}>{fieldErrors.confirmPassword}</p>}
          </div>

          <button className="btn"  style={{ marginTop: 12, backgroundColor: "#2563eb", borderColor: "#1d4ed8", color: "#fff" }} disabled={busy}>
            {busy ? "Creating account..." : "Register"}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Link href="/exhibitions" className="muted">← Back to exhibitions</Link>
        </div>
      </div>
    </div>
  );
}
