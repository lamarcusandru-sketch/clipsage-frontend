export default function ClipSageApp() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold">ClipSage</a>

          <nav className="flex items-center gap-4 text-sm text-gray-300">
            <a href="/pricing" className="hover:text-white">Pricing</a>
            <a href="/account" className="hover:text-white">Account</a>
            <button className="rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black">
              Upgrade
            </button>
          </nav>
        </header>

        <section className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
            Search the moments that matter
          </p>

          <h1 className="mb-4 text-4xl font-bold md:text-6xl">
            Find the exact clip.
            <br />
            Skip the endless scrolling.
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-gray-400">
            Search podcasts, interviews, debates, and long-form videos for the
            part you actually need.
          </p>

          <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 md:flex-row">
            <input
              type="text"
              placeholder="Try: Iran rejects peace talks"
              className="flex-1 rounded-xl bg-zinc-900 px-5 py-4 text-white outline-none placeholder:text-gray-500"
            />

            <button className="rounded-xl bg-yellow-400 px-6 py-4 font-bold text-black">
              Search
            </button>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {["Ceasefire", "Trump", "AI takeover", "Iran", "Economy"].map((term) => (
              <button
                key={term}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-gray-300 hover:border-yellow-400 hover:text-white"
              >
                {term}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <article
              key={item}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="mb-4 aspect-video rounded-xl bg-zinc-800" />

              <p className="mb-2 text-sm text-yellow-400">Example Channel</p>

              <h2 className="mb-2 text-lg font-bold">
                Search result preview card
              </h2>

              <p className="mb-4 text-sm text-gray-400">
                Real ClipSage results will appear here once we connect Supabase.
              </p>

              <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-yellow-400">
                Watch Clip
              </button>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}