import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const { token } = useParams(); // Get the token from the URL
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists when the page loads
    if (!token) {
      setError("Invalid or expired token.");
    }
  }, [token]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post("/reset-password", {
        token,
        newPassword,
      });
      console.log(response.data);

      setSuccess("Password reset successfully.");
      setError("");
      setTimeout(() => navigate("/login"), 3000); // Redirect to login after 3 seconds
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="relative h-screen m-0 p-0 object-contain overflow-hidden w-full bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: `url(${process.env.PUBLIC_URL + "/platter.jpg"})` }}>
      
      <h2 className="flex justify-center mb-3 mt-5 font-extrabold p-10 text-[70px] text-white">Reset Password</h2>

        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-500 mb-4">{success}</div>}

        <form onSubmit={handleResetPassword} className="flex flex-col items-center">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border px-4 text-base h-[60px] w-[400px] focus:outline-none focus:ring-0 focus:border-yellow-500 rounded-3xl mb-4"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border text-base px-4 h-[60px] w-[400px] focus:outline-none focus:ring-0 focus:border-yellow-500 rounded-3xl mb-4"
            required
          />
          <button
            type="submit"
            className="w-[100px] text-black py-2 rounded-3xl font-bold  bg-white hover:bg-green-500 transition-transform duration-200 transform hover:scale-105  "
          >
            Reset Password
          </button>
        </form>
      
    </div>
  );
};

export default ResetPassword;
