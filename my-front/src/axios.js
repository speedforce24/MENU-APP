import axios from "axios";

const api = axios.create({
  baseURL: "/api", // 👈 proxied via vercel.json rewrites
});

/**
 * Attach the saved token to every outgoing request so individual pages
 * don't have to assemble the Authorization header themselves.
 */
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    /* ignore */
  }
  return config;
});

/**
 * Centralized session-expiry handling. If the backend ever tells us the
 * token is bad (expired, revoked, malformed), wipe local session and send
 * the user to /login — but only from inside an authenticated area.
 */
let isRedirecting = false;
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    // Don't bounce the user from the login or register call itself —
    // "wrong password" there is a normal 401-ish, not a session expiry.
    const isAuthCall = url.includes("/auth/login") || url.includes("/auth/register");

    if (status === 401 && !isAuthCall && !isRedirecting) {
      isRedirecting = true;
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch {
        /* ignore */
      }
      // Give the current call a moment to settle before navigating.
      setTimeout(() => {
        window.location.assign("/login?reason=expired");
      }, 50);
    }
    return Promise.reject(error);
  }
);

/**
 * Pull a user-friendly message out of an axios error.
 * - 429 (rate limit): always surfaced — the user NEEDS to see why we refused.
 * - Other errors: use the server-provided `error` field, else the fallback.
 */
export const describeError = (err, fallback = "Something went wrong. Try again.") => {
  const serverMsg = err?.response?.data?.error;
  if (err?.response?.status === 429) {
    return serverMsg || "Too many requests. Slow down a moment and try again.";
  }
  return serverMsg || fallback;
};

export default api;
