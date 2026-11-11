import { useState, useEffect, useRef } from "react";
import api from "../axios";
import Rating from "react-rating";
import "@fortawesome/fontawesome-free/css/all.css";
import { toast } from "react-toastify";
import LogoutButton from "../components/LogoutButton";
import DeleteAccountButton from "../components/DeleteAccountButton";
import useSessionGuard from "../hooks/useSessionGuard";

const UserDashboard = () => {
  useSessionGuard();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [foods, setFoods] = useState([]);
  const [ratings, setRatings] = useState({});
  const token = localStorage.getItem("token") || "";
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const [comments, setComments] = useState({});
  const imageBasePath = api.defaults.baseURL || "/api";

  const getImageSrc = (imagePath) => {
    if (!imagePath) return "";
    if (/^https?:\/\//i.test(imagePath)) return imagePath;
    const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${imageBasePath}${normalizedPath}`;
  };

  const hasFetchedRatings = useRef(false);

  // ✅ Fetch restaurants
  useEffect(() => {
    api
      .get("/restaurants", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setRestaurants(res.data))
      .catch((error) => console.error("Error fetching restaurants:", error));
  }, [token]);

  // ✅ Fetch foods when restaurant is selected
  useEffect(() => {
    if (!selectedRestaurant) return;

    api
      .get(`/foods/${selectedRestaurant}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setFoods(res.data);
        hasFetchedRatings.current = false; // reset flag for ratings fetch
      })
      .catch((error) => console.error("Error fetching foods:", error));
  }, [selectedRestaurant, token]);

  // ✅ Fetch ratings once when foods are loaded
  useEffect(() => {
    if (!foods.length || !user?._id || hasFetchedRatings.current) return;

    const fetchUserRatings = async () => {
      const map = {};
      await Promise.all(
        foods.map(async (food) => {
          try {
            const res = await api.get(`/ratings/${food._id}/user/${user._id}`);
            map[food._id] = res.data.value || 0;
          } catch (err) {
            console.error("Could not fetch rating for food:", food._id);
          }
        })
      );
      setRatings(map);
      hasFetchedRatings.current = true;
    };

    fetchUserRatings();
  }, [foods, user]);

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 py-6 sm:py-8 px-4 md:px-6"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL + "/beautiful.jpg"})`,
      }}
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md sm:mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍲</span>
            <span className="text-base font-black tracking-tight text-white sm:text-lg">
              Chop<span className="text-amber-400">List</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DeleteAccountButton />
            <LogoutButton />
          </div>
        </header>

        {/* Restaurant Selector */}
        <div className="mb-5 sm:mb-6 rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md p-4 md:p-5 shadow-xl transition-all duration-300 hover:shadow-emerald-500/20">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <h1 className="text-lg sm:text-xl font-bold text-white">Select a Restaurant</h1>
            <select
              className="w-full md:max-w-sm rounded-xl border border-white/20 bg-white/90 px-4 py-3.5 text-base text-slate-900 transition-all duration-200 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
            >
              <option value="">Choose a restaurant</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant._id} value={restaurant.restaurantName}>
                  {restaurant.restaurantName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Display Food Items */}
        {selectedRestaurant && (
          <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md p-4 sm:p-5 md:p-6 shadow-xl transition-all duration-300 hover:shadow-emerald-500/15">
            <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-5 sm:mb-6">
              {selectedRestaurant} Menu
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {foods.map((food) => (
                <div
                  key={food._id}
                  className={`rounded-2xl border p-3.5 sm:p-4 shadow-md bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    food.active ? "border-slate-200" : "opacity-50 grayscale pointer-events-none border-slate-300"
                  }`}
                >
                  <img
                    src={getImageSrc(food.image)}
                    alt={food.foodName}
                    className="w-full h-36 sm:h-40 object-cover rounded-xl"
                  />
                  <h3 className="text-base sm:text-lg font-bold mt-3">{food.foodName}</h3>
                  <p className="text-sm sm:text-base text-gray-600">₦{food.price}</p>

                  <div className="mt-2">
                    <Rating
                      initialRating={ratings[food._id] || 0}
                      onChange={async (newValue) => {
                        try {
                          await api.post(`/ratings/${food._id}`, {
                            userId: user._id,
                            value: newValue,
                          });
                          setRatings((prev) => ({
                            ...prev,
                            [food._id]: newValue,
                          }));
                          toast.success("Rating successful");
                        } catch (err) {
                          console.error("Rating failed:", err);
                        }
                        localStorage.setItem("user_updated", "true");
                      }}
                      emptySymbol={
                        <i className="far fa-star text-yellow-400 text-xl" />
                      }
                      fullSymbol={
                        <i className="fas fa-star text-yellow-500 text-xl" />
                      }
                    />
                  </div>

                  <textarea
                    placeholder="Leave a comment (anonymous)"
                    className="mt-3 w-full rounded-xl border border-slate-300 p-2.5 text-sm transition-all duration-200 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
                    value={comments[food._id] || ""}
                    onChange={(e) =>
                      setComments((prev) => ({
                        ...prev,
                        [food._id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    onClick={async () => {
                      const comment = comments[food._id];
                      if (!comment) return;

                      try {
                        await api.post(`/comments/${food._id}`, { comment });
                        toast.success("Comment submitted anonymously ✅");
                        setComments((prev) => ({ ...prev, [food._id]: "" }));
                      } catch (err) {
                        console.error("Comment submission failed:", err);
                        toast.error("Comment failed ❌");
                      }
                      localStorage.setItem("user_updated", "true");
                    }}
                    className="mt-2 w-full rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  >
                    Submit Comment
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
