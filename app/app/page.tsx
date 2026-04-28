"use client";

import Link from "next/link";

export default function AppPage() {
  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="ClipSage" className="w-8 h-8" />
          <div>
            <div className="font-bold text-lg">ClipSage</div>
            <div className="text-xs text-white/60">
              Find exact moments inside podcasts, interviews, and videos
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/pricing" className="hover:text-yellow-300 transition">
            Pricing
          </Link>

          <Link href="/about" className="hover:text-yellow-300 transition">
            About
          </Link>

          <Link href="/landing" className="hover:text-yellow-300 transition">
            How It Works
          </Link>

          <button className="hover:text-yellow-300 transition">
            Account
          </button>

          <button className="bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold hover:bg-yellow-300 transition">
            Upgrade
          </button>
        </nav>
      </header>

      <section className="text-center py-16 px-4">
        <img src="/logo.png" alt="ClipSage" className="mx-auto mb-6 w-20" />

        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          Find the exact moment that matters.
        </h1>

        <p className="text-white/70 max-w-xl mx-auto mb-10">
          Search podcasts, interviews, and long-form videos to pull up the exact
          part you need in seconds. Built for podcast lovers, creators, and researchers!
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 mb-12">
        <p className="text-xs text-white/50 tracking-widest mb-4">
          FEATURED HOT SEARCHES
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {["War", "Ceasefire", "Iran"].map((item) => (
            <div
              key={item}
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition"
            >
              <p className="text-xs text-white/50 mb-2">HOT SEARCH</p>
              <p className="font-semibold text-lg">{item}</p>
              <p className="text-sm text-white/60">See clips in seconds!</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}