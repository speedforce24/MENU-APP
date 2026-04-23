import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../axios";


const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user"); // Default role

  const handleRegister = async (e) => {
    e.preventDefault();
   if (role === 'admin' && !email.endsWith('@gmail.com')) {
  toast.error('Only @gmail.com emails are allowed for admins');
  return;
}

if (role === 'user' && !email.endsWith('@yopmail.com')) {
  toast.error('Only @yopmail.com emails are allowed for students');
  return;
}

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        role, // Send role selection
      });

      
       // Show success message
       if (response.status === 201) {
        toast.success("Registration successful");
 setTimeout(() => {
        navigate("/login");
      }, 5000);
      }
    } catch (error) {
      toast.error("Registration failed! " + error.response?.data?.error);
    }
  };
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-amber-900 px-4 py-6 sm:py-8 flex items-center justify-center"
      style={{ backgroundImage: `url(${process.env.PUBLIC_URL + "/platter.jpg"})` }}
    >
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-950/70 backdrop-blur-xl shadow-2xl p-5 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-amber-500/20">
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
          Create account
        </h2>
        <p className="text-center text-sm sm:text-base text-slate-200 mb-5 sm:mb-6">
          Join and start exploring menus and ratings.
        </p>
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

          {/* Role Selection */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="w-full rounded-xl border border-white/15 bg-white/95 px-4 py-3.5 text-slate-900 transition-all duration-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
          >
            <option value="user">Student</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            className="w-full rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Register
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link
            to="/login"
            className="font-semibold text-white transition-colors hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 rounded"
          >
            Have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
