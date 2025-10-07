import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("https://menu-app-ythl.onrender.com/api/auth/login", {
        email,
        password,
      });

      const token = res.data.token;
      const user = res.data.user;

      if (token && user) {
        // ✅ clear stale flags
        localStorage.removeItem("user_updated");

        // ✅ keep normal storage for backwards compatibility
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // ✅ store role-specific data to prevent overwriting admin sessions
        if (user.role === "admin") {
          localStorage.setItem("adminUser", JSON.stringify(user));
          localStorage.setItem("adminToken", token);
        } else {
          localStorage.setItem("appUser", JSON.stringify(user));
          localStorage.setItem("appToken", token);
        }

        toast.success("Login successful!");

        // ✅ redirect by role
        if (user.role === "admin") {
          setTimeout(() => navigate("/admin"), 1000);
        } else {
          setTimeout(() => navigate("/user"), 1000);
        }
      } else {
        toast.error("Invalid login response");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed! Check your credentials.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-all"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
