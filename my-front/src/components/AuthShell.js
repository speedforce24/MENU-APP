import { Link } from "react-router-dom";

/**
 * Shared auth screen layout (Login + Register share the same shell).
 * Desktop: split-screen — animated gradient brand panel on the left,
 *          form card on the right.
 * Mobile:  brand panel collapses, form fills the viewport.
 */
const AuthShell = ({ eyebrow, title, subtitle, children }) => {
  const foodEmojis = ["🍜", "🍗", "🥘", "🌯", "🍲", "🍛", "🍔", "🍕"];

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white overflow-hidden">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* ============ LEFT: brand / vibe panel ============ */}
        <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-amber-900 p-10 xl:p-14">
          {/* animated blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-amber-500/40 blur-3xl animate-blob" />
            <div className="absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-emerald-500/30 blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl animate-blob animation-delay-4000" />
          </div>

          {/* top: logo */}
          <div className="relative z-10 flex items-center gap-2">
            <span className="text-3xl">🍲</span>
            <Link to="/" className="text-2xl font-black tracking-tight">
              Chop<span className="text-amber-400">List</span>
            </Link>
          </div>

          {/* middle: pitch */}
          <div className="relative z-10 max-w-md">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse" />
              Campus eats · built different
            </p>
            <h1 className="text-4xl xl:text-5xl font-black leading-tight">
              Every <span className="shimmer-text">canteen</span>.
              <br />
              Every plate.
              <br />
              One app.
            </h1>
            <p className="mt-4 text-slate-300">
              Scroll the menu, rate the plate, drag your gees. All anonymous,
              all vibes, no stress.
            </p>

            {/* floating emoji row */}
            <div className="mt-8 flex gap-3">
              {foodEmojis.slice(0, 5).map((emoji, i) => (
                <span
                  key={emoji}
                  className="animate-float-slow text-3xl drop-shadow-lg"
                  style={{ animationDelay: `${i * 0.4}s` }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>

          {/* bottom: tiny stats */}
          <div className="relative z-10 flex gap-6 text-sm text-slate-300">
            <div>
              <div className="text-xl font-black text-white">10+</div>
              <div className="opacity-70">canteens</div>
            </div>
            <div>
              <div className="text-xl font-black text-white">500+</div>
              <div className="opacity-70">plates</div>
            </div>
            <div>
              <div className="text-xl font-black text-white">🫶</div>
              <div className="opacity-70">0 cringe</div>
            </div>
          </div>
        </aside>

        {/* ============ RIGHT: form card ============ */}
        <main className="relative flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
          {/* subtle blobs on mobile too */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
            <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-amber-500/25 blur-3xl animate-blob" />
            <div className="absolute bottom-0 -left-16 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl animate-blob animation-delay-2000" />
          </div>

          <div className="relative z-10 w-full max-w-md animate-pop-in">
            {/* mobile brand strip (shown when left panel is hidden) */}
            <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
              <span className="text-2xl">🍲</span>
              <Link to="/" className="text-xl font-black tracking-tight">
                Chop<span className="text-amber-400">List</span>
              </Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-amber-500/10 sm:p-7 md:p-8">
              {eyebrow && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                  {eyebrow}
                </p>
              )}
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1.5 text-sm text-slate-300 sm:text-base">
                  {subtitle}
                </p>
              )}

              <div className="mt-6">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthShell;
