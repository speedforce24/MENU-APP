import { useState, useEffect, useRef, useMemo } from "react";
import api, { describeError } from "../axios";
import Rating from "react-rating";
import "@fortawesome/fontawesome-free/css/all.css";
import { toast } from "react-toastify";
import { FiSearch, FiMessageCircle, FiImage } from "react-icons/fi";
import LogoutButton from "../components/LogoutButton";
import DeleteAccountButton from "../components/DeleteAccountButton";
import useSessionGuard from "../hooks/useSessionGuard";

const isCloudUrl = (p) => typeof p === "string" && /^https?:\/\//i.test(p);

const FoodImage = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);
  const usable = isCloudUrl(src) && !failed;

  if (!usable) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-slate-500">
        <div className="flex flex-col items-center gap-1.5">
          <FiImage className="h-7 w-7" />
          <span className="text-[11px] font-semibold uppercase tracking-widest">
            Image pending
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-40 w-full rounded-xl object-cover"
      loading="lazy"
    />
  );
};

const UserDashboard = () => {
  useSessionGuard();

  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const firstName = useMemo(() => {
    const name = user?.name || user?.email?.split("@")[0] || "there";
    return name.split(" ")[0];
  }, [user]);

  const hasFetchedRatings = useRef(false);

  useEffect(() => {
    api
      .get("/restaurants")
      .then((res) => setRestaurants(res.data))
      .catch(() => toast.error("Couldn't load restaurants"));
  }, []);

  useEffect(() => {
    if (!selectedRestaurant) {
      setFoods([]);
      return;
    }
    setLoadingFoods(true);
    api
      .get(`/foods/${selectedRestaurant}`)
      .then((res) => {
        setFoods(res.data);
        hasFetchedRatings.current = false;
      })
      .catch(() => toast.error("Couldn't load menu"))
      .finally(() => setLoadingFoods(false));
  }, [selectedRestaurant]);

  useEffect(() => {
    if (!foods.length || !user?._id || hasFetchedRatings.current) return;

    const fetchUserRatings = async () => {
      const map = {};
      await Promise.all(
        foods.map(async (food) => {
          try {
            const res = await api.get(`/ratings/${food._id}/user/${user._id}`);
            map[food._id] = res.data.value || 0;
          } catch {
            /* ignore per-food rating miss */
          }
        })
      );
      setRatings(map);
      hasFetchedRatings.current = true;
    };

    fetchUserRatings();
  }, [foods, user]);

  const filteredRestaurants = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter((r) =>
      r.restaurantName.toLowerCase().includes(q)
    );
  }, [restaurants, query]);

  const handleRate = async (foodId, newValue) => {
    try {
      await api.post(`/ratings/${foodId}`, {
        userId: user._id,
        value: newValue,
      });
      setRatings((prev) => ({ ...prev, [foodId]: newValue }));
      toast.success("Rating saved");
    } catch (err) {
      toast.error(describeError(err, "Rating failed"));
    }
  };

  const handleComment = async (foodId) => {
    const comment = (comments[foodId] || "").trim();
    if (!comment) return;
    setSubmittingComment((s) => ({ ...s, [foodId]: true }));
    try {
      await api.post(`/comments/${foodId}`, { comment });
      toast.success("Comment submitted anonymously");
      setComments((prev) => ({ ...prev, [foodId]: "" }));
    } catch (err) {
      toast.error(describeError(err, "Comment failed"));
    } finally {
      setSubmittingComment((s) => ({ ...s, [foodId]: false }));
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      {/* soft glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-7">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
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

        {/* Greeting */}
        <section className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Hey, <span className="text-amber-300">{firstName}</span> 👋
          </h1>
          <p className="mt-1 text-sm text-slate-300 sm:text-base">
            Pick a spot, rate what you ate. Your comments stay anonymous.
          </p>
        </section>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search restaurants"
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 backdrop-blur-md transition-all duration-200 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
            />
          </div>
        </div>

        {/* Restaurant chips */}
        <div className="mb-6 flex flex-wrap gap-2">
          {filteredRestaurants.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
              No restaurants match "{query}".
            </div>
          )}
          {filteredRestaurants.map((r) => {
            const active = selectedRestaurant === r.restaurantName;
            return (
              <button
                key={r._id}
                type="button"
                onClick={() => setSelectedRestaurant(r.restaurantName)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "border-amber-300/60 bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/20"
                    : "border-white/10 bg-white/5 text-slate-200 hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-white"
                }`}
              >
                {r.restaurantName}
              </button>
            );
          })}
        </div>

        {/* Menu */}
        {!selectedRestaurant ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center backdrop-blur-md">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-2xl">
              🍴
            </div>
            <h3 className="text-lg font-bold text-white">Pick a restaurant above</h3>
            <p className="mt-1 text-sm text-slate-400">
              Tap a chip to see its menu and start rating.
            </p>
          </div>
        ) : loadingFoods ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="h-40 w-full rounded-xl bg-white/10" />
                <div className="mt-3 h-4 w-2/3 rounded bg-white/10" />
                <div className="mt-2 h-3 w-1/3 rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : foods.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center backdrop-blur-md">
            <h3 className="text-lg font-bold text-white">No dishes yet</h3>
            <p className="mt-1 text-sm text-slate-400">
              {selectedRestaurant} hasn't added any food yet. Check back soon.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                {selectedRestaurant}
              </h2>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                {foods.filter((f) => f.active).length} available
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
              {foods.map((food) => {
                const rated = (ratings[food._id] || 0) > 0;
                return (
                  <div
                    key={food._id}
                    className={`group rounded-2xl border bg-white/95 p-3.5 shadow-md backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20 sm:p-4 ${
                      food.active
                        ? "border-white/60"
                        : "pointer-events-none border-slate-300 opacity-50 grayscale"
                    }`}
                  >
                    <div className="relative">
                      <FoodImage src={food.image} alt={food.foodName} />
                      <div className="absolute left-2 top-2 flex items-baseline gap-1 rounded-full bg-slate-900/85 px-2.5 py-1 backdrop-blur">
                        <span className="text-[11px] font-bold text-amber-300">
                          ₦{food.price}
                        </span>
                        <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">
                          /spoon
                        </span>
                      </div>
                      {rated && (
                        <div className="absolute right-2 top-2 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">
                          Rated
                        </div>
                      )}
                    </div>

                    <h3 className="mt-3 text-base font-bold text-slate-900 sm:text-lg">
                      {food.foodName}
                    </h3>

                    <div className="mt-1.5">
                      <Rating
                        initialRating={ratings[food._id] || 0}
                        onChange={(v) => handleRate(food._id, v)}
                        emptySymbol={
                          <i className="far fa-star text-xl text-amber-400" />
                        }
                        fullSymbol={
                          <i className="fas fa-star text-xl text-amber-500" />
                        }
                      />
                    </div>

                    <div className="mt-3">
                      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                        <FiMessageCircle className="h-3.5 w-3.5" /> Anonymous feedback
                      </label>
                      <textarea
                        placeholder="How did it taste?"
                        rows={2}
                        value={comments[food._id] || ""}
                        onChange={(e) =>
                          setComments((prev) => ({
                            ...prev,
                            [food._id]: e.target.value,
                          }))
                        }
                        className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-900 transition-all duration-200 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
                      />
                      <button
                        type="button"
                        onClick={() => handleComment(food._id)}
                        disabled={
                          submittingComment[food._id] ||
                          !(comments[food._id] || "").trim()
                        }
                        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-slate-900 disabled:hover:shadow-none"
                      >
                        {submittingComment[food._id] ? "Sending…" : "Send feedback"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
