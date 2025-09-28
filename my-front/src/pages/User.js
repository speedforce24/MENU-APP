import { useState, useEffect, useRef } from "react";
import api from "../axios"; // ✅ replaced axios with api instance
import Rating from "react-rating";
import "@fortawesome/fontawesome-free/css/all.css";
import { toast } from "react-toastify";

const UserDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [foods, setFoods] = useState([]);
  const [ratings, setRatings] = useState({});
  const token = localStorage.getItem("token") || "";
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const [comments, setComments] = useState({});

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
      className="min-h-screen w-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL + "/beautiful.jpg"})`,
      }}
    >
      {/* Restaurant Selector */}
      <div className="flex items-center gap-4 mb-6 bg-white bg-opacity-80 p-4 rounded-lg shadow-lg">
        <h1 className="text-xl font-bold">Select a Restaurant</h1>
        <select
          className="p-2 border rounded"
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

      {/* Display Food Items */}
      {selectedRestaurant && (
        <div className="w-full max-w-5xl bg-white bg-opacity-90 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold text-center mb-6">
            {selectedRestaurant} Menu
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
            {foods.map((food) => (
              <div
                key={food._id}
                className={`border w-36 h-42 rounded-lg flex flex-col items-center shadow-md p-3 bg-white ${
                  food.active ? "" : "opacity-50 grayscale pointer-events-none"
                }`}
              >
                <img
                  src={`${food.image}`}
                  alt={food.foodName}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <h3 className="text-lg font-bold text-center mt-2">
                  {food.foodName}
                </h3>
                <p className="text-gray-600 text-center">₦{food.price}</p>

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
                  }}
                  emptySymbol={
                    <i className="far fa-star text-yellow-400 text-xl" />
                  }
                  fullSymbol={
                    <i className="fas fa-star text-yellow-500 text-xl" />
                  }
                />
                <textarea
                  placeholder="Leave a comment (anonymous)"
                  className="mt-2 w-full p-1 border rounded text-sm"
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
                  }}
                  className="text-xs bg-blue-500 text-white px-3 py-1 rounded mt-1"
                >
                  Submit Comment
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
