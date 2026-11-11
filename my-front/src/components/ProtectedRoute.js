import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { getToken, getRole, isTokenExpired, logout } from "../utils/auth";

/**
 * Gate a route behind a valid session (and optionally a role).
 *   <ProtectedRoute>                → any authenticated user
 *   <ProtectedRoute role="admin">   → admins only
 *
 * Missing/expired token → boot to /login.
 * Wrong role            → send user to their own dashboard.
 */
const ProtectedRoute = ({ role, children }) => {
  const location = useLocation();
  const toastShown = useRef(false);

  const token = getToken();
  const expired = isTokenExpired(token);
  const currentRole = getRole();

  const notSignedIn = !token || expired;
  const wrongRole = !notSignedIn && role && currentRole !== role;

  useEffect(() => {
    if (notSignedIn && !toastShown.current) {
      toastShown.current = true;
      if (expired) {
        logout({ redirectTo: null }); // clear only; <Navigate> handles routing
        toast.info("Your session expired. Sign in again.");
      } else {
        toast.info("Sign in to continue.");
      }
    } else if (wrongRole && !toastShown.current) {
      toastShown.current = true;
      toast.error("You don't have access to that page.");
    }
  }, [notSignedIn, expired, wrongRole]);

  if (notSignedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (wrongRole) {
    return <Navigate to={currentRole === "admin" ? "/admin" : "/user"} replace />;
  }

  return children;
};

export default ProtectedRoute;
