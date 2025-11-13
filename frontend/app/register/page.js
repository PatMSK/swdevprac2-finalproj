"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";

const REQUIRED_FIELDS = ["name", "email", "tel", "password"];
const labelRowStyle = { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 };
const errorTextStyle = { color: "#d14343", fontSize: "0.8rem" };
const submitButtonStyle = { backgroundColor: "#fcead6", color: "#4a2c00", borderColor: "#fcead6" };

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
  const [form, setForm] = useState({ name: "", email: "", tel: "", role: "member", password: "" });
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
      await register(form);
      router.push("/exhibitions");
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="panel" style={{maxWidth: 640, margin: "24px auto"}}>
      <h2>Register</h2>
      <form className="grid" style={{ gridTemplateColumns: "1fr", rowGap: 16 }} onSubmit={onSubmit}>
        <div className="field">
          <div style={labelRowStyle}>
            <label htmlFor="name">Name</label>
            {hasSubmitted && fieldErrors.name && <small style={errorTextStyle}>{fieldErrors.name}</small>}
          </div>
          <input id="name" value={form.name} onChange={handleChange("name")} />
        </div>
        <div className="field">
          <div style={labelRowStyle}>
            <label htmlFor="email">Email</label>
            {hasSubmitted && fieldErrors.email && <small style={errorTextStyle}>{fieldErrors.email}</small>}
          </div>
          <input id="email" type="email" value={form.email} onChange={handleChange("email")} />
        </div>
        <div className="field">
          <div style={labelRowStyle}>
            <label htmlFor="tel">Tel</label>
            {hasSubmitted && fieldErrors.tel && <small style={errorTextStyle}>{fieldErrors.tel}</small>}
          </div>
          <input id="tel" type="tel" value={form.tel} onChange={handleChange("tel")} />
        </div>
        {/* Role is fixed to 'member' for public registration — removed ability to request admin */}
        <div className="field">
          <div style={labelRowStyle}>
            <label htmlFor="password">Password</label>
            {hasSubmitted && fieldErrors.password && <small style={errorTextStyle}>{fieldErrors.password}</small>}
          </div>
          <input id="password" type="password" value={form.password} onChange={handleChange("password")} />
        </div>
        {error && <div className="error" style={{gridColumn: "1/-1"}}>{String(error)}</div>}
        <div style={{gridColumn: "1/-1"}}>
          <button className="btn btn-accent" style={submitButtonStyle} disabled={busy}>{busy?"Registering...":"Register"}</button>
        </div>
      </form>
    </div>
  );
}
