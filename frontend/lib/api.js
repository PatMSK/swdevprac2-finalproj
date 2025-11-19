export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

async function request(path, { method = "GET", body, token, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {})
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText;
    const err = new Error(msg);
    // attach status and body for callers that want to inspect
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  // Auth
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  logout: (token) => request("/auth/logout", { method: "GET", token }),
  me: (token) => request("/auth/me", { method: "GET", token }),

  // Exhibitions
  getExhibitions: () => request("/exhibitions"),
  getExhibition: (id) => request(`/exhibitions/${id}`),
  createExhibition: (token, payload) => request("/exhibitions", { method: "POST", token, body: payload }),
  updateExhibition: (token, id, payload) => request(`/exhibitions/${id}`, { method: "PUT", token, body: payload }),
  deleteExhibition: (token, id) => request(`/exhibitions/${id}`, { method: "DELETE", token }),

  // Bookings
  getBookings: (token) => request("/booking", { token }),
  getBooking: (token, id) => request(`/booking/${id}`, { token }),
  createBooking: (token, payload) => request("/booking", { method: "POST", token, body: payload }),
  updateBooking: (token, id, payload) => request(`/booking/${id}`, { method: "PUT", token, body: payload }),
  deleteBooking: (token, id) => request(`/booking/${id}`, { method: "DELETE", token })
};

