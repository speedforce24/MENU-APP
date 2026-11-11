import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import api, { describeError } from "../axios";
import { logout } from "../utils/auth";

/**
 * "Delete my account" with a two-step confirm: an initial click opens a
 * modal, and the destructive action requires typing DELETE to arm.
 */
const DeleteAccountButton = ({ isAdmin = false }) => {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const close = () => {
    if (isDeleting) return;
    setOpen(false);
    setConfirmText("");
  };

  const handleDelete = async () => {
    if (confirmText !== "DELETE" || isDeleting) return;
    setIsDeleting(true);
    try {
      await api.delete("/auth/me");
      toast.success("Your account has been deleted.");
      logout({ redirectTo: "/" });
    } catch (err) {
      toast.error(describeError(err, "Failed to delete account"));
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-400/60 hover:bg-rose-500/20 hover:text-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70"
      >
        <FiTrash2 size={16} />
        <span>Delete account</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-pop-in"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-rose-400/30 bg-slate-900 p-6 shadow-2xl shadow-rose-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-rose-200">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-300 animate-pulse" />
              Permanent
            </div>
            <h3 className="text-2xl font-black text-white">Delete your account?</h3>
            <p className="mt-2 text-sm text-slate-300">
              {isAdmin ? (
                <>
                  This will permanently remove your account, every restaurant you
                  own, and all their menus, ratings and comments. This can't be
                  undone.
                </>
              ) : (
                <>
                  This will permanently remove your account and any data tied to
                  it. This can't be undone.
                </>
              )}
            </p>

            <label className="mt-5 block text-xs font-semibold uppercase tracking-widest text-rose-200">
              Type <span className="font-mono">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="mt-2 w-full rounded-lg border border-white/15 bg-white/95 px-3 py-2.5 font-mono text-sm tracking-widest text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300/60"
              placeholder="DELETE"
            />

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={close}
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={confirmText !== "DELETE" || isDeleting}
                className="flex-1 rounded-xl bg-rose-500 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-400 hover:shadow-lg hover:shadow-rose-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:bg-rose-500 disabled:hover:shadow-none"
              >
                {isDeleting ? "Deleting…" : "Delete forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteAccountButton;
