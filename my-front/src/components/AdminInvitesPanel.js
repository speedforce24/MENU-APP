import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { describeError } from "../axios";

const statusStyles = {
  active: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
  used: "bg-slate-500/20 text-slate-200 border-slate-400/40",
  expired: "bg-rose-500/20 text-rose-200 border-rose-400/40",
};

const fmtDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "";
  }
};

const Modal = ({ code, expiresAt, ttlHours, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Clipboard unavailable — copy manually");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-pop-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-amber-400/30 bg-slate-900 p-6 shadow-2xl shadow-amber-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse" />
          One-time reveal
        </div>
        <h3 className="text-2xl font-black text-white">
          Admin invite ready 🪪
        </h3>
        <p className="mt-1 text-sm text-slate-300">
          Share this code with the new admin. It won't be shown again.
        </p>

        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Invite code
          </p>
          <p className="mt-1 break-all font-mono text-xl font-bold tracking-widest text-amber-300">
            {code}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-300">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Expires
            </p>
            <p className="mt-0.5 font-medium text-slate-100">{fmtDate(expiresAt)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Valid for
            </p>
            <p className="mt-0.5 font-medium text-slate-100">{ttlHours}h · single use</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={copyCode}
            className="flex-1 rounded-xl bg-amber-400 py-3 font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-500/30"
          >
            {copied ? "Copied ✓" : "Copy code"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
          >
            I've saved it
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-rose-300/80">
          ⚠ Once you close this, the code is gone from our screens.
        </p>
      </div>
    </div>
  );
};

const AdminInvitesPanel = () => {
  const [invites, setInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [revealed, setRevealed] = useState(null); // { code, expiresAt, ttlHours } | null

  const loadInvites = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await api.get("/auth/admin-invites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvites(res.data);
    } catch (err) {
      console.error("Load invites failed:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const generate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    const token = localStorage.getItem("token");
    try {
      const res = await api.post(
        "/auth/admin-invites",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRevealed(res.data);
      loadInvites();
    } catch (err) {
      toast.error(describeError(err, "Failed to generate invite"));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-4 sm:p-5 md:p-6 shadow-xl transition-all duration-300 hover:shadow-amber-500/15">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">
            Admin invites
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Generate a single-use code so another canteen owner can become an admin.
          </p>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isGenerating ? "Generating…" : "+ Generate invite"}
        </button>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <p className="text-sm text-slate-300">Loading invites…</p>
        ) : invites.length === 0 ? (
          <p className="text-sm text-slate-300">
            No invites yet. Generate one above.
          </p>
        ) : (
          <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {invites.map((inv) => (
              <li
                key={inv._id}
                className="flex flex-col gap-2 rounded-xl border border-white/10 bg-slate-900/60 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-mono text-sm font-semibold tracking-widest text-amber-200">
                    {inv.maskedCode}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Created {fmtDate(inv.createdAt)}
                    {inv.status === "used" && inv.usedBy && (
                      <> · used by <span className="text-slate-200">{inv.usedBy.email}</span></>
                    )}
                    {inv.status === "active" && (
                      <> · expires {fmtDate(inv.expiresAt)}</>
                    )}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest ${statusStyles[inv.status]}`}
                >
                  {inv.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {revealed && (
        <Modal
          code={revealed.code}
          expiresAt={revealed.expiresAt}
          ttlHours={revealed.ttlHours}
          onClose={() => setRevealed(null)}
        />
      )}
    </div>
  );
};

export default AdminInvitesPanel;
