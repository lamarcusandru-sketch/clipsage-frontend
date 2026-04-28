import Link from "next/link";

export const metadata = {
  title: "About ClipSage | Search Podcasts & Find Exact Video Moments",
  description:
    "ClipSage is a video search engine that helps you find exact moments inside podcasts, interviews, and long-form YouTube videos instantly. No more scrubbing.",
  keywords: [
    "search podcasts",
    "find video moments",
    "youtube clip finder",
    "podcast search engine",
    "find exact quote in video",
    "video search tool",
    "clip finder",
    "search interviews",
  ],
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#070b12] text-white">
      {/* HEADER */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="ClipSage" className="h-10 w-10 rounded-full" />
          <span className="text-xl font-black">ClipSage</span>
        </Link>

        <nav className="flex items-center gap-5 text-sm font-semibold">
          <Link href="/pricing" className="text-slate-300 hover:text-white">
            Pricing
          </Link>
          <Link href="/app" className="text-slate-300 hover:text-white">
            Search
          </Link>
          <Link
            href="/app"
            className="rounded-xl bg-yellow-400 px-4 py-2 font-black text-black"
          >
            Try Free
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-20">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-300">
          About ClipSage
        </p>

        <h1 className="mt-4 text-5xl font-black leading-tight md:text-6xl">
          A search engine for video.
        </h1>

        <p className="mt-6 text-lg leading-8 text-slate-300">
          ClipSage helps you find exact moments inside podcasts, interviews, and
          long-form YouTube videos — instantly.
        </p>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-5xl space-y-10 px-6 pb-24 text-lg leading-8 text-slate-300">
        <p>
          Most video content today is long-form. Podcasts, interviews,
          livestreams, and discussions can run for hours. Somewhere inside those
          hours are the moments people actually care about — the insights, the
          quotes, the reactions.
        </p>

        <p>
          But finding those moments has always been slow. You scroll. You guess.
          You scrub through timelines hoping to land on the right second. Most
          people give up before they ever find what they were looking for.
        </p>

        <p className="text-white font-bold">
          ClipSage exists to fix that.
        </p>

        <p>
          Instead of watching entire videos, you can search by topic, keyword,
          name, or phrase and instantly get clips that match what you're looking
          for. Click a result and jump directly to the exact timestamp.
        </p>

        <p>
          Whether you're a content creator looking for clips, a researcher
          searching conversations, or someone trying to find a specific quote,
          ClipSage turns long videos into searchable content.
        </p>

        <h2 className="text-3xl font-black text-white">
          What ClipSage Helps You Do
        </h2>

        <ul className="space-y-4">
          <li>• Search podcasts and interviews by keyword or phrase</li>
          <li>• Find exact timestamps in long YouTube videos</li>
          <li>• Discover viral or important moments instantly</li>
          <li>• Save time by skipping hours of scrubbing</li>
          <li>• Turn long-form content into searchable knowledge</li>
        </ul>

        <h2 className="text-3xl font-black text-white">
          Built for the Way People Actually Watch Content
        </h2>

        <p>
          People don’t watch everything anymore. They search for what matters.
          ClipSage is built around that idea — helping you go straight to the
          moment instead of the beginning.
        </p>

        <p>
          The internet made information accessible. ClipSage makes it findable
          inside video.
        </p>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 px-6 py-20 text-center">
        <h2 className="text-4xl font-black">
          Find the moment. Skip the rest.
        </h2>

        <p className="mt-4 text-lg text-slate-300">
          Start searching podcasts, interviews, and videos instantly.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/app"
            className="rounded-2xl bg-yellow-400 px-8 py-4 text-lg font-black text-black"
          >
            Search Now — Free
          </Link>

          <Link
            href="/pricing"
            className="rounded-2xl border border-white/20 px-8 py-4 text-lg font-black"
          >
            View Pricing
          </Link>
        </div>
      </section>
    </main>
  );
}