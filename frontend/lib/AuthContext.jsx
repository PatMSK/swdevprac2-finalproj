"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";

const AuthContext = createContext(null);

function loadStored() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("byb_auth");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveStored(data) {
  try { localStorage.setItem("byb_auth", JSON.stringify(data)); } catch {}
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = loadStored();
    if (stored?.token) {
      setToken(stored.token);
      // fetch profile
      api.me(stored.token)
        .then((res) => setUser(res?.data || res))
        .catch(() => { setToken(null); setUser(null); saveStored(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setError(null);
    const res = await api.login({ email, password });
    const newToken = res?.token;
    if (!newToken) throw new Error("No token returned");
    setToken(newToken);
    saveStored({ token: newToken });
    const me = await api.me(newToken);
    setUser(me?.data || me);
    return me;
  };

  const register = async (payload) => {
    setError(null);
    const res = await api.register(payload);
    const newToken = res?.token;
    if (newToken) {
      setToken(newToken);
      saveStored({ token: newToken });
      const me = await api.me(newToken);
      setUser(me?.data || me);
    }
    return res;
  };

  const logout = async () => {
    try { if (token) await api.logout(token); } catch {}
    setToken(null);
    setUser(null);
    saveStored(null);
  };

  const value = useMemo(() => ({ token, user, role: user?.role, loading, error, setError, login, register, logout }), [token, user, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    console.warn("useAuth called outside AuthProvider – returning fallback ctxt to avoid crash");
    return {
      token: null,
      user: null,
      role: null,
      loading: true,
      error: null,
      setError: () => {},
      login: async () => { throw new Error("AuthProvider missing"); },
      register: async () => { throw new Error("AuthProvider missing"); },
      logout: () => {},
    };
  }
  return ctx;
}
