import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // 🛠 combined import
import api from "../axios"; // ✅ replaced axios with your api instance
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      className="relative h-screen m-0 p-0 object-contain overflow-hidden w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${process.env.PUBLIC_URL + "/platter.jpg"})` }}
    >
      <h2 className="flex justify-center mb-3 mt-5 font-extrabold p-10 text-[70px] text-white">Login</h2>

      <div className="flex flex-col items-center">
        {!showForgotPassword ? (
          <form onSubmit={handleLogin} className="flex flex-col items-center">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border px-4 text-base h-[60px] w-[400px] focus:outline-none focus:ring-0 focus:border-yellow-500 rounded-3xl mb-4"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border text-base px-4 h-[60px] w-[400px] focus:outline-none focus:ring-0 focus:border-yellow-500 rounded-3xl mb-4"
              required
            />
            <button type="submit" className="mt-3 bg-yellow-300 border rounded-3xl w-[100px] font-bold">
              Login
            </button>

            {/* ➡️ Forgot Password link */}
            <p
              onClick={() => setShowForgotPassword(true)}
              className="mt-2 text-yellow-300 cursor-pointer font-semibold"
            >
              Forgot Password?
            </p>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="flex flex-col items-center">
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="border px-4 text-base h-[60px] w-[400px] focus:outline-none focus:ring-0 focus:border-yellow-500 rounded-3xl mb-4"
              required
            />
            <button type="submit" className="bg-yellow-300 border rounded-3xl w-[150px] font-bold">
              Send Reset Link
            </button>
            <p
              onClick={() => setShowForgotPassword(false)}
              className="mt-2 text-yellow-300 cursor-pointer font-semibold"
            >
              Back to Login
            </p>
          </form>
        )}

        <Link to="/register" className="font-semibold mt-2">
          Don't have an account? Register
        </Link>
      </div>
    </div>
  );
};

export default Login;
