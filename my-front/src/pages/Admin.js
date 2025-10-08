import { useState, useEffect } from "react";
import api from "../axios"
import { FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";


const Admin = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [foodName, setFoodName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [foods, setFoods] = useState([]);
  const [avgRatings, setAvgRatings] = useState({});
  const [fileName, setFileName] = useState("");
  const [user, setUser] = useState(null);


useEffect(() => {
  const fetchAvg = async () => {
    const map = {};
    await Promise.all(
      foods.map(async (food) => {
        try {
          const res = await api.get(`/ratings/${food._id}/average`);
          map[food._id] = res.data.average?.toFixed(1) || "0.0";
        } catch (err) {
          console.error("Admin avg fetch failed", err);
        }
      })
    );
    setAvgRatings(map);
  };

  if (foods.length) fetchAvg();
}, [foods]);

  // Fetch restaurants on mount
 useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const token = localStorage.getItem("token");
    api
      .get(`/restaurants/user/${parsedUser._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
       
    console.log("🚀 restaurant response:", res.data);
   
        setRestaurants(res.data);
        if (res.data.length > 0) {
          setSelectedRestaurant(res.data[0].restaurantName);
        }
      })
      .catch((err) => console.error("Error fetching user-specific restaurants:", err));
  }
}, []);

  // Fetch foods when selected restaurant changes
  useEffect(() => {
    if (!selectedRestaurant) return;
    const token = localStorage.getItem("token");
    api
      .get(`/foods/${selectedRestaurant}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then(async (res) => {
  const foodWithComments = await Promise.all(
    res.data.map(async (food) => {
      const commentsRes = await api.get(`/comments/${food._id}`);
      return { ...food, comments: commentsRes.data };
    })
  );
  setFoods(foodWithComments);
})

      .catch((err) => console.error("Error fetching foods:", err));
  }, [selectedRestaurant]);

  const handleImageChange = (e) => {
  const file = e.target.files[0];
  setImage(file);
  setFileName(file?.name || ""); // Set the name if it exists
};


  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!selectedRestaurant || !user?._id) {
    alert("Restaurant and user must be set");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Login required");
    return;
  }

  try {
    // 1. Ensure the restaurant exists or create it
    let restaurantExists = restaurants.some(
      (r) => r.restaurantName.toLowerCase() === selectedRestaurant.toLowerCase()
    );

    if (!restaurantExists) {
      const res = await api.post(
        "/restaurants",
        { restaurantName: selectedRestaurant, createdBy: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newRestaurant = res.data.restaurant;
      setRestaurants((prev) => [...prev, newRestaurant]);
      toast.success("Restaurant created");
    }

    // 2. Proceed with food upload
    const formData = new FormData();
    formData.append("restaurantName", selectedRestaurant);
    formData.append("foodName", foodName);
    formData.append("price", price);
    formData.append("image", image);

    const res = await api.post("/foods", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    setFoods([...foods, res.data.food]);
    setFoodName("");
    setPrice("");
    setImage(null);
    document.getElementById("file-upload").value = null;
    toast.success("Food added successfully✅ ");
  } catch (err) {
    console.error("Error in handleSubmit:", err.response?.data || err.message);
    toast.error("Failed to upload food");
  }
};


  const toggleFoodActive = async (foodId, currentStatus) => {
    const token = localStorage.getItem("token");
    try {
      const res = await api.patch(
        `/foods/${foodId}/toggle`,
        { active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFoods((prev) =>
        prev.map((food) => (food._id === foodId ? { ...food, active: res.data.active } : food))
      );
    } catch (err) {
      console.error("Error toggling food status:", err.response?.data || err.message);
    }
  };

 const deleteFood = async (foodId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this food?");
  if (!confirmDelete) return;

  const token = localStorage.getItem("token");

  try {
    await api.delete(`/foods/${foodId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setFoods((prev) => prev.filter((food) => food._id !== foodId));
    toast.success("Food deleted successfully! 🍽️");
  } catch (err) {
    console.error("Error deleting food:", err.response?.data || err.message);
    toast.error("Failed to delete food. 😢");
  }
};


  return (
  <div className="h-screen w-full flex flex-col lg:flex-row items-center justify-center bg-gray-100">
    {/* Form Section - LEFT */}
    <div className="w-full lg:w-1/2 h-full max-h-lg overflow-y-auto flex items-center justify-center">
      <div className="p-6 max-w-lg w-full mt-6  bg-white bg-opacity-80 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Admin Panel</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter or select restaurant name"
            list="restaurant-options"
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="border p-2 w-full rounded-3xl"
            required
          />
          <datalist id="restaurant-options">
            {restaurants.map((r) => (
              <option key={r._id} value={r.restaurantName} />
            ))}
          </datalist>

          <input
            type="text"
            placeholder="Food Name"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            className="border p-2 w-full rounded-3xl"
            required
          />
          <input
            type="text"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border p-2 w-full rounded-3xl"
            required
          />

          <input
            type="file"
            id="file-upload"
            onChange={handleImageChange}
            className="hidden"
            required
          />
          <div className="flex items-center gap-3 mt-5">
            <label
              htmlFor="file-upload"
              className="bg-yellow-500 text-white px-4 py-2 rounded-3xl text-center cursor-pointer inline-block"
            >
              Upload Food Image
            </label>
            {fileName && (
              <span className="text-sm text-gray-700 truncate max-w-[150px]">
                {fileName}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="bg-yellow-500 text-white px-4 py-2 w-full rounded-3xl"
          >
            Add Food
          </button>
        

        <div className=" max-w-lg w-full h-full max-h-lg bg-gray-100 rounded-lg p-4 shadow-inner">
          <h3 className="text-xl font-semibold mb-4">Uploaded Foods</h3>
          {foods.length === 0 ? (
            <p>No foods uploaded yet.</p>
          ) : (
            <ul>
              {foods.map((food) => (
                <li
                  key={food._id}
                  className={`flex items-center justify-between p-2 mb-2 rounded ${
                    food.active === false
                      ? "bg-gray-300 text-gray-500"
                      : "bg-white"
                  }`}
                >
                  <div>
                    <span className="font-semibold">{food.foodName}</span>
                    <p className="text-sm text-gray-500">
                      ⭐ Avg Rating: {avgRatings[food._id] || "0.0"}
                    </p>
                    {food.comments?.length > 0 && (
                 <div className="mt-2 bg-gray-100 p-2 rounded text-sm max-h-32 overflow-y-auto">
                 <strong>Comments:</strong>
                 <ul className="list-disc pl-4">
                 {food.comments.map((c, i) => (
                <li key={i}>{c.comment}</li>
          ))}
        </ul>
      </div>
    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="inline-flex relative items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={food.active !== false}
                        onChange={() => toggleFoodActive(food._id, food.active)}
                      />
                      <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-yellow-500 transition-colors"></div>
                      <div className="dot absolute left-0 top-1 bg-white w-3 h-4 rounded-full transition-transform peer-checked:translate-x-[24px]" />
                    </label>
                    <button onClick={() => deleteFood(food._id)} title="Delete Food">
                      <FiTrash2 className="text-red-600 hover:text-red-800" size={20} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        </form>
      </div>
    </div>

    {/* Image Section - RIGHT */}
    <div
      className="hidden lg:block w-1/2 h-full bg-cover bg-center"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL + "/admin.jpg"})`,
      }}
    />
  </div>
);

  
};

export default Admin;
