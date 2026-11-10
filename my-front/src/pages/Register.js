import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api, { describeError } from "../axios";
import AuthShell from "../components/AuthShell";

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

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showInviteField, setShowInviteField] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    api.get("/health").catch(() => {});
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isRegistering) return;

    setIsRegistering(true);
    try {
      const payload = { name, email, password };
      if (showInviteField && inviteCode.trim()) {
        payload.inviteCode = inviteCode.trim();
      }

      const response = await api.post("/auth/register", payload);

      if (response.status === 201) {
        toast.success("Account created! Log in to continue.");
        navigate("/login");
      }
    } catch (error) {
      toast.error(describeError(error, "Registration failed. Try again."));
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <AuthShell
      eyebrow="New here?"
      title="Create your account"
      subtitle="Join the campus."
    >
      <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-xl border border-white/15 bg-white/95 px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-500 transition-all duration-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-white/15 bg-white/95 px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-500 transition-all duration-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-white/15 bg-white/95 px-4 py-3.5 pr-20 text-base text-slate-900 placeholder:text-slate-500 transition-all duration-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
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

          {!showInviteField ? (
            <button
              type="button"
              onClick={() => setShowInviteField(true)}
              className="w-full rounded-xl border border-dashed border-white/15 bg-transparent px-4 py-3 text-sm text-slate-300 transition-colors hover:border-amber-300/60 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
            >
              Got an invite code? <span className="font-semibold">Enter it</span>
            </button>
          ) : (
            <div className="rounded-xl border border-amber-300/30 bg-amber-300/5 p-3">
              <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-amber-200">
                <span>Invite code</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteField(false);
                    setInviteCode("");
                  }}
                  className="text-[11px] font-semibold text-slate-300 underline-offset-4 hover:underline"
                >
                  Skip
                </button>
              </label>
              <input
                type="text"
                placeholder="CHOP-XXXX-XXXX-XXXX"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-lg border border-white/15 bg-white/95 px-3 py-2.5 font-mono text-sm tracking-widest text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isRegistering}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:bg-amber-400 disabled:hover:shadow-none"
          >
            {isRegistering ? (
              <>
                <Spinner />
                <span>Creating account…</span>
              </>
            ) : (
              "Register"
            )}
          </button>
      </form>

      <div className="mt-5 text-center">
        <Link
          to="/login"
          className="rounded text-sm font-semibold text-slate-300 transition-colors hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
        >
          Have an account?{" "}
          <span className="text-amber-300 underline underline-offset-4">Login</span>
        </Link>
      </div>
    </AuthShell>
  );
};

export default Register;
