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
 * Order of preference:
 * 1. Server-provided `error` field (specific, written for this exact call).
 * 2. Friendly per-status fallback (matches the HTTP meaning).
 * 3. The caller's generic fallback.
 * 4. A last-resort "something went wrong".
 * Raw axios messages like "Request failed with status code 500" never
 * reach the user.
 */
export const describeError = (err, fallback = "Something went wrong. Try again.") => {
  const serverMsg = err?.response?.data?.error;
  if (serverMsg) return serverMsg;

  // No response at all = the request didn't reach the server.
  if (!err?.response) {
    return "Can't reach the server right now. Check your connection and try again.";
  }

  const status = err.response.status;
  const statusMessages = {
    400: "That didn't look right. Double-check and try again.",
    401: "Your session expired. Please log in again.",
    403: "You don't have permission to do that.",
    404: "We couldn't find what you were looking for.",
    409: "That conflicts with something already saved.",
    413: "That file is too large.",
    415: "That file type isn't supported.",
    429: "Too many requests. Slow down a moment and try again.",
    500: "Server hiccup on our end. Try again in a moment.",
    502: "Server is restarting. Give it a few seconds and retry.",
    503: "Server is temporarily unavailable. Try again shortly.",
    504: "Server took too long to respond. Try again.",
  };
  return statusMessages[status] || fallback;
};

export default api;
