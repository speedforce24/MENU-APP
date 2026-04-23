import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // 🛠 combined import
import api from "../axios"; // ✅ replaced axios with your api instance
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false); // ➡️ for toggling form
  const [forgotEmail, setForgotEmail] = useState(""); // ➡️ for forgot password email input
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      console.log("🔍 Sending Login Request:", { email, password });

      const res = await api.post("/auth/login", { email, password }); // ✅ updated

      const token = res.data.token;
      console.log("✅ Token received:", token);

      if (token) {
        localStorage.setItem("token", token);
        console.log("🔍 Received Role:", res.data.role);
        localStorage.setItem("token", res.data.token);
        console.log("🧪 res.data.user is:", res.data.user);

        localStorage.setItem("user", JSON.stringify(res.data.user));
        res.data.role === "admin"
          ? setTimeout(() => {
              navigate("/admin");
            }, 5000)
          : setTimeout(() => {
              navigate("/user");
            }, 5000);
        // after login success
         

        toast.success("Login successful");
      } else {
        console.error("❌ No token received");
        toast.error("Login failed! Invalid credentials.");
      }
    } catch (err) {
      console.error("❌ Login Error:", err.response?.data || err.message);
      toast.error(
        "Login failed! " + (err.response?.data?.error || "Try again.")
      );
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/forgot-password", { email: forgotEmail }); // ✅ updated
      toast.success("Reset link sent to your email!");
      setShowForgotPassword(false); // hide form after sending
      setForgotEmail("");
    } catch (err) {
      console.error(
        "❌ Forgot Password Error:",
        err.response?.data || err.message
      );
      toast.error("Failed to send reset link. Try again.");
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-amber-900 px-4 py-6 sm:py-8 flex items-center justify-center"
      style={{ backgroundImage: `url(${process.env.PUBLIC_URL + "/platter.jpg"})` }}
    >
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-950/70 backdrop-blur-xl shadow-2xl p-5 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-amber-500/20">
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
          Welcome back
        </h2>
        <p className="text-center text-sm sm:text-base text-slate-200 mb-5 sm:mb-6">
          Login to continue your food experience.
        </p>
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
              className="w-full rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Login
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
              className="w-full rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Send Reset Link
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
          className="block text-center font-semibold mt-5 text-white transition-colors hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 rounded"
        >
          Don't have an account? Register
        </Link>
      </div>
    </div>
  );
};

export default Login;
