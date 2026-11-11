import { FiLogOut } from "react-icons/fi";
import { toast } from "react-toastify";
import { logout } from "../utils/auth";

const LogoutButton = ({ className = "" }) => {
  const handleLogout = () => {
    toast.success("Logged out.");
    logout({ redirectTo: "/" });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-400/40 hover:bg-rose-500/20 hover:text-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70 ${className}`}
    >
      <FiLogOut size={16} />
      <span>Log out</span>
    </button>
  );
};

export default LogoutButton;
