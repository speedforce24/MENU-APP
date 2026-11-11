import { useEffect } from "react";
import { toast } from "react-toastify";
import { msUntilExpiry, logout } from "../utils/auth";

/**
 * Kicks the user out the moment their JWT expires, instead of waiting for
 * the next failed API call. Safe to call on any authenticated page.
 */
const useSessionGuard = () => {
  useEffect(() => {
    const ms = msUntilExpiry();
    if (ms === null) return; // non-JWT token — nothing to time

    if (ms <= 0) {
      toast.info("Your session expired. Sign in again.");
      logout();
      return;
    }

    const timer = setTimeout(() => {
      toast.info("Your session expired. Sign in again.");
      logout();
    }, ms);

    return () => clearTimeout(timer);
  }, []);
};

export default useSessionGuard;
