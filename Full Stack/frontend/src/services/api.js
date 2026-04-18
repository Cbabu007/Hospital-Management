const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
export const AUTH_TOKEN_KEY = "authToken";

const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

const request = async (path, options = {}) => {
  let response;
  const token = getAuthToken();

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    throw new Error("Unable to connect backend. Start backend on http://localhost:5000");
  }

  const text = await response.text();
  let payload = {};

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const fallback = text && text.length < 200 ? text : `Request failed (${response.status})`;
    throw new Error(payload.message || fallback);
  }

  return payload;
};

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  postForm: async (path, formData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    const text = await response.text();
    let payload = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = {};
    }
    if (!response.ok) {
      const fallback = text && text.length < 200 ? text : `Request failed (${response.status})`;
      throw new Error(payload.message || fallback);
    }
    return payload;
  },
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
