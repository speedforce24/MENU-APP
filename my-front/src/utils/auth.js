/**
 * Session / JWT helpers. Lives client-side only — the backend remains the
 * authority on whether a token is actually valid. These helpers just stop
 * us from showing authenticated UI when we already know the local token is
 * missing or expired.
 */

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** Decode a JWT payload without verifying — purely for reading `exp`. */
const decodePayload = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/** Milliseconds until expiry. Negative = already expired. null = unknown. */
export const msUntilExpiry = (token = getToken()) => {
  const payload = decodePayload(token);
  if (!payload || typeof payload.exp !== "number") return null;
  return payload.exp * 1000 - Date.now();
};

export const isTokenExpired = (token = getToken()) => {
  const ms = msUntilExpiry(token);
  return ms !== null && ms <= 0;
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  return !isTokenExpired(token);
};

export const getRole = () => getUser()?.role || null;

/** Clear session + optionally redirect. Safe to call from anywhere. */
export const logout = ({ redirectTo = "/login" } = {}) => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
  if (redirectTo && typeof window !== "undefined") {
    window.location.assign(redirectTo);
  }
};
