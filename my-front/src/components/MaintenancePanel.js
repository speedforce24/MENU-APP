import { useState } from "react";
import { toast } from "react-toastify";
import api, { describeError } from "../axios";

const MaintenancePanel = () => {
  const [isCleaning, setIsCleaning] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const runCleanup = async () => {
    if (isCleaning) return;
    setIsCleaning(true);
    try {
      const res = await api.post("/auth/orphans/cleanup");
      setLastResult(res.data.counts);
      const total = Object.values(res.data.counts).reduce((a, b) => a + b, 0);
      toast.success(total === 0 ? "Nothing to clean up." : "Orphan data removed.");
    } catch (err) {
      toast.error(describeError(err, "Cleanup failed"));
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-4 sm:p-5 md:p-6 shadow-xl transition-all duration-300 hover:shadow-amber-500/15">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">
            Maintenance
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Remove restaurants whose owner no longer exists, along with their
            menus, ratings and comments.
          </p>
        </div>
        <button
          type="button"
          onClick={runCleanup}
          disabled={isCleaning}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/40 hover:bg-amber-400/10 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isCleaning ? "Cleaning…" : "Clean up orphans"}
        </button>
      </div>

      {lastResult && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Restaurants", lastResult.restaurants],
            ["Foods", lastResult.foods],
            ["Ratings", lastResult.ratings],
            ["Comments", lastResult.comments],
          ].map(([label, n]) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-center"
            >
              <div className="text-2xl font-black text-amber-300">{n}</div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                {label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaintenancePanel;
