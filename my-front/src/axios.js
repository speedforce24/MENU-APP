import axios from "axios";

const api = axios.create({
  baseURL: "/api", // 👈 proxied via vercel.json rewrites
});

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
