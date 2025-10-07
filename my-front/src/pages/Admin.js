import React, { useState, useEffect } from "react";
import api  from "axios";
import { toast } from "react-toastify";

const Admin = () => {
  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");

 

  useEffect(() => {
    let cancelled = false;

    const getAdminCredentials = () => {
      const adminStored = localStorage.getItem("adminUser");
      const adminToken = localStorage.getItem("adminToken");

      if (adminStored && adminToken) {
        return { stored: adminStored, token: adminToken };
      }

      // fallback if admin keys missing
      const stored = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      return { stored, token };
    };

    const fetchRestaurants = async () => {
      const { stored, token } = getAdminCredentials();
      if (!stored || !token) {
        console.warn("No admin credentials found in localStorage");
        return;
      }

      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);

      if (parsedUser.role !== "admin") {
        console.warn("Stored user is not an admin — skipping fetch");
        return;
      }

      try {
        const res = await api.get(`/restaurants/user/${parsedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (cancelled) return;

        if (Array.isArray(res.data) && res.data.length > 0) {
          setRestaurants(res.data);
          setSelectedRestaurant(
            (prev) => prev || res.data[0].restaurantName
          );
        } else {
          console.warn("No restaurants found for admin:", parsedUser._id);
          setTimeout(async () => {
            try {
              const retry = await api.get(
                `/restaurants/user/${parsedUser._id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (!cancelled && Array.isArray(retry.data) && retry.data.length) {
                setRestaurants(retry.data);
                setSelectedRestaurant(
                  (prev) => prev || retry.data[0].restaurantName
                );
              }
            } catch (err) {
              console.error("Retry failed:", err);
            }
          }, 900);
        }
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        toast.error("Failed to fetch restaurants");
      }
    };

    fetchRestaurants();

    // 🔄 Listen for user updates (rating/comments)
    const onStorage = (e) => {
      if (e.key === "user_updated" && e.newValue === "true") {
        fetchRestaurants();
        localStorage.setItem("user_updated", "false");
      }
    };

    window.addEventListener("storage", onStorage);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">Admin Dashboard</h2>

      {restaurants.length === 0 ? (
        <p className="text-gray-500">No restaurants found</p>
      ) : (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Restaurants for {user?.name}
          </h3>
          <ul className="space-y-2">
            {restaurants.map((rest) => (
              <li
                key={rest._id}
                className={`p-3 rounded border ${
                  selectedRestaurant === rest.restaurantName
                    ? "bg-blue-100"
                    : "bg-gray-50"
                }`}
              >
                {rest.restaurantName}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Admin;
