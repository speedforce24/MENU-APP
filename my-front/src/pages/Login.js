import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api, { describeError } from "../axios";
import { toast } from "react-toastify";
import AuthShell from "../components/AuthShell";
import { isAuthenticated, getRole } from "../utils/auth";

const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-slate-900"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // If a valid session exists, don't show the login form — go straight to
  // the correct dashboard. Also pop the "session expired" toast when the
  // interceptor redirected us here.
  useEffect(() => {
    if (isAuthenticated()) {
      navigate(getRole() === "admin" ? "/admin" : "/user", { replace: true });
      return;
    }
    const params = new URLSearchParams(location.search);
    if (params.get("reason") === "expired") {
      toast.info("Your session expired. Sign in again.");
    }
  }, [navigate, location.search]);

  // Warm up the Render backend so the first login request doesn't eat
  // a 30–60s cold start.
  useEffect(() => {
    api.get("/health").catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.token;

      if (!token) {
        toast.error("Login failed! Invalid credentials.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Login successful");
      navigate(res.data.role === "admin" ? "/admin" : "/user");
    } catch (err) {
      toast.error(describeError(err, "Login failed. Try again."));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (isSendingReset) return;
    setIsSendingReset(true);
    try {
      await api.post("/auth/forgot-password", { email: forgotEmail });
      toast.success("Reset link sent to your email!");
      setShowForgotPassword(false);
      setForgotEmail("");
    } catch (err) {
      toast.error(describeError(err, "Failed to send reset link. Try again."));
    } finally {
      setIsSendingReset(false);
    }
  };

  const eyebrow = showForgotPassword ? "Reset password" : "Welcome back";
  const title = showForgotPassword ? "Forgot your password?" : "Login to ChopList";
  const subtitle = showForgotPassword
    ? "Drop your email and we'll send a reset link."
    : "Pick up where you left off. Still hungry.";

  return (
    <AuthShell eyebrow={eyebrow} title={title} subtitle={subtitle}>
      {!showForgotPassword ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/95 px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-500 transition-all duration-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/95 px-4 py-3.5 pr-20 text-base text-slate-900 placeholder:text-slate-500 transition-all duration-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-xs sm:text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 rounded"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:bg-amber-400 disabled:hover:shadow-none"
            >
              {isLoggingIn ? (
                <>
                  <Spinner />
                  <span>Signing in…</span>
                </>
              ) : (
                "Login"
              )}
            </button>

            {/* ➡️ Forgot Password link */}
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="w-full text-center text-amber-200 font-semibold transition-colors hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 rounded"
            >
              Forgot Password?
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/95 px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-500 transition-all duration-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              required
            />
            <button
              type="submit"
              disabled={isSendingReset}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:bg-amber-400 disabled:hover:shadow-none"
            >
              {isSendingReset ? (
                <>
                  <Spinner />
                  <span>Sending…</span>
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full text-center text-amber-200 font-semibold transition-colors hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 rounded"
            >
              Back to Login
            </button>
          </form>
        )}

      <Link
        to="/register"
        className="mt-5 block rounded text-center text-sm font-semibold text-slate-300 transition-colors hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
      >
        Don't have an account?{" "}
        <span className="text-amber-300 underline underline-offset-4">Register</span>
      </Link>
    </AuthShell>
  );
};

export default Login;
