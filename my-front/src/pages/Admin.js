import { useState, useEffect, useRef } from "react";
import api, { describeError } from "../axios";
import { FiTrash2, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import AdminInvitesPanel from "../components/AdminInvitesPanel";
import MaintenancePanel from "../components/MaintenancePanel";
import LogoutButton from "../components/LogoutButton";
import DeleteAccountButton from "../components/DeleteAccountButton";
import useSessionGuard from "../hooks/useSessionGuard";


const Admin = () => {
  useSessionGuard();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [foodName, setFoodName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [foods, setFoods] = useState([]);
  const [avgRatings, setAvgRatings] = useState({});
  const [fileName, setFileName] = useState("");
  const [user, setUser] = useState(null);
  const [replacingFoodId, setReplacingFoodId] = useState(null);
  const replaceInputRef = useRef(null);
  const imageBasePath = api.defaults.baseURL || "/api";

  const getImageSrc = (imagePath) => {
    if (!imagePath) return "";
    if (/^https?:\/\//i.test(imagePath)) return imagePath;
    const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${imageBasePath}${normalizedPath}`;
  };


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
    toast.error(describeError(err, "Failed to upload food"));
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

  const openReplaceImagePicker = (foodId) => {
    setReplacingFoodId(foodId);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = "";
      replaceInputRef.current.click();
    }
  };

  const handleReplaceImageChange = async (e) => {
    const file = e.target.files?.[0];
    const foodId = replacingFoodId;
    setReplacingFoodId(null);
    if (!file || !foodId) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.patch(`/foods/${foodId}/image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setFoods((prev) =>
        prev.map((f) => (f._id === foodId ? { ...f, image: res.data.food.image } : f))
      );
      toast.success("Image updated ✅");
    } catch (err) {
      toast.error(describeError(err, "Failed to replace image"));
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 py-6 sm:py-8 px-4 md:px-6">
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleReplaceImageChange}
        accept="image/*"
        className="hidden"
      />
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍲</span>
            <span className="text-base font-black tracking-tight text-white sm:text-lg">
              Chop<span className="text-amber-400">List</span>
              <span className="ml-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-200">
                Admin
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DeleteAccountButton isAdmin />
            <LogoutButton />
          </div>
        </header>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
        <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-4 sm:p-5 md:p-6 shadow-xl transition-all duration-300 hover:shadow-amber-500/20">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">Admin Panel</h2>
          <p className="text-sm text-slate-200 mb-5">Manage restaurants, food items, and availability.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Enter or select restaurant name"
              list="restaurant-options"
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/90 px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-500 transition-all duration-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
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
              className="w-full rounded-xl border border-white/20 bg-white/90 px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-500 transition-all duration-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              required
            />
            <input
              type="text"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/90 px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-500 transition-all duration-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              required
            />

            <input
              type="file"
              id="file-upload"
              onChange={handleImageChange}
              className="hidden"
              required
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <label
                htmlFor="file-upload"
                className="inline-flex w-full sm:w-auto justify-center rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-900 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                Upload Food Image
              </label>
              {fileName && (
                <span className="text-xs sm:text-sm text-amber-50 truncate sm:max-w-[180px]">
                  {fileName}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Add Food
            </button>
          </form>
        </div>

        <div className="xl:col-span-3 rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md p-4 sm:p-5 md:p-6 shadow-xl transition-all duration-300 hover:shadow-amber-500/15">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Uploaded Foods</h3>
          {foods.length === 0 ? (
            <p className="text-slate-200">No foods uploaded yet.</p>
          ) : (
            <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {foods.map((food) => (
                <li
                  key={food._id}
                  className={`rounded-xl p-3 sm:p-4 border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                    food.active === false
                      ? "bg-slate-300/50 border-slate-300 text-slate-700"
                      : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={getImageSrc(food.image)}
                        alt={food.foodName}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        className="h-12 w-12 flex-shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold sm:text-base">
                          {food.foodName}
                        </p>
                        <p className="text-xs opacity-80 sm:text-sm">
                          ⭐ Avg Rating: {avgRatings[food._id] || "0.0"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => openReplaceImagePicker(food._id)}
                        title="Replace image"
                        className="rounded p-1 text-slate-500 transition-all duration-200 hover:scale-110 hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80"
                      >
                        <FiRefreshCw size={18} />
                      </button>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={food.active !== false}
                          onChange={() => toggleFoodActive(food._id, food.active)}
                        />
                        <div className="h-6 w-10 rounded-full bg-slate-300 transition-colors peer-checked:bg-amber-500" />
                        <div className="absolute left-0 top-1 h-4 w-3 rounded-full bg-white transition-transform peer-checked:translate-x-[24px]" />
                      </label>
                      <button
                        onClick={() => deleteFood(food._id)}
                        title="Delete Food"
                        className="rounded transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/80"
                      >
                        <FiTrash2 className="text-red-600 hover:text-red-800" size={20} />
                      </button>
                    </div>
                  </div>

                  {food.comments?.length > 0 && (
                    <div className="mt-3 rounded-lg bg-slate-100 p-3 text-xs sm:text-sm max-h-36 overflow-y-auto">
                      <strong>Comments:</strong>
                      <ul className="list-disc pl-4 mt-1">
                        {food.comments.map((c, i) => (
                          <li key={i}>{c.comment}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        </div>

        <AdminInvitesPanel />
        <MaintenancePanel />
      </div>
    </div>
  );
};

export default Admin;
