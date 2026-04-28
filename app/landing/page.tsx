import Link from "next/link";

const examples = ["Ceasefire", "Trump", "Iran Ceasefire", "Israel AI", "Oil Prices"];

const painPoints = [
  "Scrubbing through long podcasts",
  "Trying to remember where someone said something",
  "Wasting time hunting for one quote",
  "Missing useful clips buried deep in videos",
];

const useCases = [
  {
    icon: "🎬",
    title: "Creators",
    text: "Find clip ideas, quotes, and reaction moments faster.",
  },
  {
    icon: "🎙️",
    title: "Podcast Fans",
    text: "Jump straight to the part everyone is talking about.",
  },
  {
    icon: "📚",
    title: "Researchers",
    text: "Search real conversations without watching the whole video.",
  },
  {
    icon: "⚡",
    title: "Fast Finders",
    text: "Stop guessing. Search, click, and watch the exact moment.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#070b12] text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/app" className="flex items-center gap-3">
          <img src="/logo.png" alt="ClipSage" className="h-11 w-11 rounded-full" />
          <div>
            <div className="text-2xl font-black tracking-tight">ClipSage</div>
            <div className="text-xs text-slate-300">
              Find exact moments inside podcasts, interviews, and videos
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-5 text-sm font-semibold">
          <Link href="/pricing" className="text-slate-200 hover:text-white">
            Pricing
          </Link>
          <Link href="/app" className="text-slate-200 hover:text-white">
            Search
          </Link>
          <Link
            href="/app"
            className="rounded-2xl bg-yellow-400 px-5 py-3 font-black text-black shadow-[0_0_30px_rgba(250,204,21,0.35)] transition hover:scale-105"
          >
            Try Free
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-2">
        <div>
          <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-blue-300">
            Stop scrubbing. Start finding.
          </p>

          <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
            Find exact moments instantly.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200 md:text-xl">
            Search podcasts, interviews, and long-form videos — then jump straight
            to the part you actually need.
          </p>

          <p className="mt-5 text-xl font-bold text-white">
            Most people waste minutes finding one clip. ClipSage finds it in seconds.
          </p>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 rounded-2xl border border-white/10 bg-[#080d16] px-6 py-5 text-left text-slate-300">
                Try: Ceasefire
              </div>
              <Link
                href="/app"
                className="rounded-2xl bg-blue-500 px-8 py-5 text-center text-lg font-black text-black shadow-[0_0_30px_rgba(59,130,246,0.35)] transition hover:scale-[1.02] hover:bg-blue-400"
              >
                Search Now
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {examples.map((example) => (
                <Link
                  key={example}
                  href={`/app?q=${encodeURIComponent(example)}`}
                  className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  {example}
                </Link>
              ))}
            </div>

            <p className="mt-5 text-sm text-slate-300">
              Free plan includes{" "}
              <span className="font-black text-white">10 searches/day</span>.
              Upgrade anytime for smarter results + unlimited search.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-blue-500/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl">
            <video
              src="/instant-results.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-14 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
            <div className="text-4xl font-black text-yellow-300">60k+</div>
            <p className="mt-2 text-sm text-slate-300">searchable clip moments</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
            <div className="text-4xl font-black text-yellow-300">Seconds</div>
            <p className="mt-2 text-sm text-slate-300">to find buried moments</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
            <div className="text-4xl font-black text-yellow-300">Free</div>
            <p className="mt-2 text-sm text-slate-300">to start searching today</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-red-300">
              The Problem
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Long videos hide the best moments.
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              The clip you need might be buried 47 minutes into an interview.
              ClipSage helps you find it without watching the whole thing.
            </p>
          </div>

          <div className="space-y-4">
            {painPoints.map((point) => (
              <div
                key={point}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-lg font-bold"
              >
                ✕ {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#070b12] to-[#101827] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm font-black uppercase tracking-[0.3em] text-blue-300">
            Built For
          </p>
          <h2 className="mx-auto mt-4 max-w-4xl text-center text-4xl font-black tracking-tight md:text-5xl">
            Anyone who wants the moment, not the whole video.
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {useCases.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-black/30 p-6 shadow-xl"
              >
                <div className="text-4xl">{item.icon}</div>
                <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center text-lg font-bold text-slate-200">
            Most people keep scrolling. The smart ones search.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 md:p-12">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-300">
                How It Works
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Search. Click. Watch.
              </h2>
              <p className="mt-6 text-lg text-slate-300">
                No setup. No learning curve. Just type what you’re looking for
                and jump to the exact timestamp.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Type a topic, quote, name, or phrase",
                "Get matching clip cards instantly",
                "Click Watch Clip to jump to the moment",
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-400 font-black text-black">
                    {index + 1}
                  </div>
                  <div className="text-lg font-bold">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-300">
            Try It
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            You’re one search away from getting it.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Once you find a buried clip in seconds, scrubbing through long videos
            starts to feel ancient. Like dial-up internet with a YouTube thumbnail.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/app"
              className="rounded-2xl bg-yellow-400 px-8 py-4 text-lg font-black text-black shadow-[0_0_35px_rgba(250,204,21,0.35)] transition hover:scale-105"
            >
              Search Now — Free
            </Link>
            <Link
              href="/pricing"
              className="rounded-2xl border border-white/15 bg-white/10 px-8 py-4 text-lg font-black text-white transition hover:bg-white/20"
            >
              Unlock Smarter + Unlimited Search
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}