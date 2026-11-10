import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../axios";

const features = [
  {
    emoji: "🍲",
    title: "Every canteen, one tap",
    body: "Switch between the mama put spot, the fried rice plug, and the shawarma babe without leaving your dorm.",
    accent: "from-amber-500/30 to-amber-500/0",
  },
  {
    emoji: "⭐",
    title: "Rate the plate, honest",
    body: "Five stars for slaps. One star for scams. Your rating keeps the next person from wasting ₦2k on dry rice.",
    accent: "from-emerald-500/30 to-emerald-500/0",
  },
  {
    emoji: "🫢",
    title: "Comment anonymous",
    body: "Drop your gist on any meal without exposing yourself. The chef never has to know it was you.",
    accent: "from-fuchsia-500/30 to-fuchsia-500/0",
  },
  {
    emoji: "📸",
    title: "Admins upload fresh",
    body: "Canteen owners post photos, prices and availability. If it's off the menu today, you'll know before you walk.",
    accent: "from-sky-500/30 to-sky-500/0",
  },
  {
    emoji: "⚡",
    title: "Fast af",
    body: "React 19 + a lean Express API. Tap, rate, scroll. No load spinners from 2015 here (wait — we do have one, but it's cute).",
    accent: "from-rose-500/30 to-rose-500/0",
  },
  {
    emoji: "🫶",
    title: "Built by a student",
    body: "This is a final-year project with real range. Every pixel was fought for at 3am with Red Bull energy.",
    accent: "from-indigo-500/30 to-indigo-500/0",
  },
];

const steps = [
  { n: "01", title: "Sign up", body: "Students with @yopmail, admins with @gmail. No long thing." },
  { n: "02", title: "Pick canteen", body: "Hit the dropdown and choose whose kitchen you're entering today." },
  { n: "03", title: "Rate & comment", body: "Smash the stars, drop a review, help the next hungry soul." },
];

const testimonials = [
  { name: "Tomi, 400L", text: "Found a jollof plug I never knew existed. 10/10, my CGPA thanks you.", emoji: "🍛" },
  { name: "Aisha, 300L", text: "The anonymous comments feature is diabolical in the best way. I said what I said.", emoji: "😎" },
  { name: "Chuks, 500L", text: "Our canteen's business doubled after we listed. Shout out to the dev.", emoji: "🔥" },
];

const faqs = [
  {
    q: "Is this a real app or just a school project?",
    a: "Both. It's a final-year full-stack build, but every feature works end-to-end — real auth, real database, real uploads.",
  },
  {
    q: "Why the yopmail / gmail rule?",
    a: "Students sign in with a disposable campus-style email (@yopmail.com), admins with @gmail.com. It's a lightweight demo of role gating.",
  },
  {
    q: "Where's the data stored?",
    a: "MongoDB Atlas on the backend, with JWT-protected routes. Images sit on the server's uploads folder for now.",
  },
  {
    q: "Can I use this for my own campus?",
    a: "Absolutely. The code is on GitHub — clone it, re-skin it, make it yours.",
  },
];

const Pill = ({ children }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-200">
    <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse" />
    {children}
  </span>
);

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);

  // Warm up Render on landing too — most visits hit this page first.
  useEffect(() => {
    api.get("/health").catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-950 text-white">
      {/* ================= NAV ================= */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/10 bg-slate-950/80 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍲</span>
            <span className="text-xl font-black tracking-tight sm:text-2xl">
              Chop<span className="text-amber-400">List</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:text-white sm:px-4"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-500/30 sm:px-5 sm:py-2.5"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <header className="relative isolate overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pt-36 lg:pt-44">
        {/* background blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-amber-500/25 blur-3xl animate-blob" />
          <div className="absolute top-40 -right-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 -left-20 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl animate-blob animation-delay-4000" />
          {/* grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage:
                "radial-gradient(ellipse at center, black 40%, transparent 75%)",
            }}
          />
        </div>

        <div className="mx-auto max-w-5xl text-center">
          <Pill>Campus eats · built different</Pill>
          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="shimmer-text">Campus food,</span>
            <br />
            rated by the people <br className="hidden sm:block" />
            who actually <span className="italic text-amber-400">eat it.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg md:text-xl">
            Every canteen on your campus, in one app. Browse the menu, rate the
            plate, drop anonymous gist. Admins post what's cooking today — you
            decide what's worth the walk.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-base font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-500/30 sm:w-auto"
            >
              Start eating smart
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
            >
              I already have an account
            </Link>
          </div>

          {/* floating emoji strip */}
          <div className="mt-14 flex items-center justify-center gap-4 sm:gap-6">
            {["🍜", "🍗", "🥘", "🍛", "🍔", "🍕", "🌯", "🥟"].map((e, i) => (
              <span
                key={e}
                className="animate-float-slow text-3xl sm:text-4xl md:text-5xl drop-shadow-xl"
                style={{ animationDelay: `${i * 0.25}s` }}
              >
                {e}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ================= MARQUEE ================= */}
      <section className="relative overflow-hidden border-y border-white/10 bg-amber-400 py-4 text-slate-900">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array(2)
            .fill(0)
            .map((_, k) => (
              <div key={k} className="flex shrink-0 items-center gap-10 px-5 text-base font-black uppercase tracking-widest sm:text-lg">
                <span>🍲 real canteens</span><span>·</span>
                <span>⭐ real ratings</span><span>·</span>
                <span>🫢 real anonymous gist</span><span>·</span>
                <span>⚡ built in a hostel room</span><span>·</span>
                <span>🫶 final year energy</span><span>·</span>
              </div>
            ))}
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="relative px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <Pill>What's on the menu</Pill>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Features that <span className="text-amber-400">actually</span> slap.
            </h2>
            <p className="mt-4 text-slate-300 sm:text-lg">
              No bloat. No ads. Just the stuff you'd actually open the app for.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-2xl hover:shadow-amber-500/10"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />
                <div className="relative">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                    {f.emoji}
                  </div>
                  <h3 className="text-xl font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-300 sm:text-base">
                    {f.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="relative px-4 py-24 sm:px-6">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/3 top-10 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl animate-blob" />
        </div>
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <Pill>How it works</Pill>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Three steps, zero stress.
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-7 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40"
              >
                <div className="text-5xl font-black text-amber-400/90 sm:text-6xl">
                  {s.n}
                </div>
                <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-slate-300">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="relative px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <Pill>Hostel talk</Pill>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Shout outs from the <span className="text-amber-400">timeline.</span>
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-400/30"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-3xl">{t.emoji}</div>
                <p className="mt-4 text-slate-200 italic">"{t.text}"</p>
                <p className="mt-4 text-sm font-bold text-amber-300">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="relative px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <Pill>FAQ</Pill>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Questions you probably have.
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:border-amber-400/30 open:border-amber-400/40 open:bg-white/10"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="text-base font-semibold sm:text-lg">
                    {f.q}
                  </span>
                  <span className="text-xl text-amber-400 transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-slate-300 sm:text-base">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-amber-500/20 via-slate-900 to-emerald-500/20 p-8 text-center sm:p-14">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -left-10 h-72 w-72 rounded-full bg-amber-500/30 blur-3xl animate-blob" />
              <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-emerald-500/30 blur-3xl animate-blob animation-delay-2000" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-black sm:text-5xl">
                Hungry? Let's go.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-200 sm:text-lg">
                Takes 30 seconds to sign up. Takes 10 seconds to find your next
                meal. Takes 2 seconds to drag whoever sold you dry rice.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-base font-bold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-500/30 sm:w-auto"
                >
                  Create account
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
                <Link
                  to="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10 px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-400 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍲</span>
            <span className="font-bold text-white">
              Chop<span className="text-amber-400">List</span>
            </span>
            <span className="opacity-60">© {new Date().getFullYear()}</span>
          </div>
          <p className="text-center opacity-80">
            Built with React, Express & jollof rice. Final year project energy.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
