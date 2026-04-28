"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient, Session, User } from "@supabase/supabase-js";

type Clip = {
  id?: string;
  channel_name?: string;
  video_title?: string;
  clip_title?: string;
  quote_text?: string;
  transcript_chunk?: string;
  start_seconds?: number;
  thumbnail_url?: string;
  youtube_video_id?: string;
  video_url?: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const hotSearches = [
  { title: "War", sub: "See Clips In Seconds!" },
  { title: "Ceasefire", sub: "Fast, broad, timely!" },
  { title: "Iran", sub: "Instant Search!" },
];

const suggestions = [
  "Peace Talks",
  "Israel",
  "AI",
  "Candace Owens",
  "Destiny",
  "Ceasefire",
  "War",
  "Islam",
  "Oil Shortage",
  "Asmongold",
];

const titleFont = {
  fontFamily:
    '"Arial Rounded MT Bold", "Cooper Black", "Trebuchet MS", Arial, sans-serif',
};

function getAnonId() {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem("clipsage_anon_id");
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem("clipsage_anon_id", created);
  return created;
}

function secondsToTimestamp(total?: number) {
  const safe = Math.max(0, Number(total || 0));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = Math.floor(safe % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function makeYouTubeUrl(clip: Clip) {
  const start = Math.max(0, Number(clip.start_seconds || 0));

  if (clip.youtube_video_id) {
    return `https://www.youtube.com/watch?v=${clip.youtube_video_id}&t=${start}s`;
  }

  if (clip.video_url) {
    const separator = clip.video_url.includes("?") ? "&" : "?";
    return `${clip.video_url}${separator}t=${start}s`;
  }

  return "#";
}

export default function AppPage() {
  const [query, setQuery] = useState("");
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);

  const initials = useMemo(() => {
    const email = user?.email || "CS";
    return email.slice(0, 2).toUpperCase();
  }, [user]);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user || null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loading) return;

    const messages = [
      "Searching the transcript vault...",
      "Finding the sharpest matching moments...",
      "Pulling clips from the long-video jungle...",
    ];

    let index = 0;
    setLoadingMessage(messages[index]);

    const timer = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingMessage(messages[index]);
    }, 1600);

    return () => clearInterval(timer);
  }, [loading]);

  async function runSearch(searchText?: string) {
    const finalQuery = (searchText || query).trim();

    if (!finalQuery) {
      setError("Type something first.");
      return;
    }

    setQuery(finalQuery);
    setError("");
    setLoading(true);
    setClips([]);

    try {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error("Missing Supabase environment variables.");
      }

      const token = session?.access_token;
      const anonId = getAnonId();

      const response = await fetch(`${SUPABASE_URL}/functions/v1/search-clips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: finalQuery,
          q: finalQuery,
          limit: 9,
          offset: 0,
          anon_id: anonId,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Search failed.");
      }

      const results = data?.clips || data?.results || data?.data || [];
      setClips(Array.isArray(results) ? results : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAccountOpen(false);
  }

  async function goToUpgrade() {
    try {
      if (!session?.access_token || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
        window.location.href = "/pricing";
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      window.location.href = "/pricing";
    } catch {
      window.location.href = "/pricing";
    }
  }

  return (
    <main className="min-h-screen bg-[#070b12] text-white">
      <header className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-8">
        <Link href="/app" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="ClipSage"
            className="h-12 w-12 rounded-2xl object-contain drop-shadow-[0_0_18px_rgba(96,165,250,0.25)]"
          />

          <div>
            <div className="text-2xl font-black leading-none" style={titleFont}>
              ClipSage
            </div>
            <div className="mt-1 text-sm text-slate-300">
              Find exact moments inside podcasts, interviews, and videos
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-7 text-sm font-bold">
          <Link href="/pricing" className="hover:text-yellow-300">
            Pricing
          </Link>

          <Link href="/about" className="hover:text-yellow-300">
            About
          </Link>

          <Link href="/landing" className="hover:text-yellow-300">
            How It Works
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 hover:bg-white/10"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-xs font-black">
                  {initials}
                </span>
                <span>Account</span>
                <span>▾</span>
              </button>

              {accountOpen && (
                <div className="absolute right-0 z-50 mt-3 w-56 rounded-2xl border border-white/10 bg-[#111722] p-3 shadow-2xl">
                  <div className="border-b border-white/10 px-3 pb-3 text-xs text-slate-300">
                    {user.email}
                  </div>

                  <Link
                    href="/pricing"
                    className="block rounded-xl px-3 py-3 text-sm hover:bg-white/10"
                  >
                    Manage / Pricing
                  </Link>

                  <button
                    onClick={signOut}
                    className="block w-full rounded-xl px-3 py-3 text-left text-sm hover:bg-white/10"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="hover:text-yellow-300">
              Account
            </Link>
          )}

          <button
            onClick={goToUpgrade}
            className="rounded-2xl bg-yellow-400 px-6 py-3 font-black text-black shadow-[0_0_30px_rgba(250,204,21,0.25)] hover:bg-yellow-300"
          >
            Upgrade
          </button>
        </nav>
      </header>

      <section className="mx-auto max-w-[1150px] px-6 pt-10">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="ClipSage"
            className="mx-auto h-32 w-32 object-contain drop-shadow-[0_0_35px_rgba(96,165,250,0.25)]"
          />

          <h1
            className="mx-auto mt-8 max-w-5xl text-6xl font-black leading-[0.95] tracking-tight md:text-8xl"
            style={titleFont}
          >
            Find the exact moment that matters.
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-xl leading-8 text-slate-300">
            Search podcasts, interviews, and long-form videos to pull up the exact part you need in
            seconds. Built for podcast lovers, creators, and researchers!
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-5xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-slate-400">
            Featured Hot Searches
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {hotSearches.map((item) => (
              <button
                key={item.title}
                onClick={() => runSearch(item.title)}
                className="group rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-left shadow-xl transition duration-200 hover:-translate-y-1 hover:border-blue-300/30 hover:bg-white/[0.09] hover:shadow-[0_0_35px_rgba(96,165,250,0.12)]"
              >
                <p className="text-xs font-black uppercase tracking-wide text-blue-200">
                  Hot Search
                </p>
                <h3 className="mt-4 text-xl font-black" style={titleFont}>
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-slate-300">{item.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-7 max-w-5xl rounded-[1.7rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl">
          <div className="flex gap-4">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") runSearch();
              }}
              placeholder="Try: Ceasefire"
              className="min-h-[72px] flex-1 rounded-2xl border border-white/10 bg-[#090f19] px-7 text-xl text-white outline-none placeholder:text-slate-500"
            />

            <button
              onClick={() => runSearch()}
              disabled={loading}
              className="rounded-2xl bg-blue-400 px-9 text-lg font-black text-black shadow-[0_0_30px_rgba(96,165,250,0.25)] hover:bg-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Finding..." : "Find Clips"}
            </button>
          </div>

          <p className="mt-6 text-base text-slate-300">
            <span className="font-black text-white">Search for a moment, not a video.</span> Try a
            name, topic, or exact quote.
          </p>

          <p className="mt-5 text-xl font-black" style={titleFont}>
            10 free searches left
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Free plan: 10 searches/day. Unlock smarter results + unlimited search.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {suggestions.map((item) => (
              <button
                key={item}
                onClick={() => runSearch(item)}
                className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm font-black shadow-sm transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={goToUpgrade}
              className="rounded-2xl bg-yellow-400 px-9 py-4 text-base font-black text-black shadow-[0_0_35px_rgba(250,204,21,0.35)] transition hover:-translate-y-1 hover:bg-yellow-300"
            >
              Unlock Smarter + Unlimited Search
            </button>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-[1150px] pb-20">
          <p className="mb-5 text-lg font-black text-white">
            Search a name, topic, or quote to find exact clips in seconds.
          </p>

          {loading && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-slate-300">
              {loadingMessage}
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-6 text-red-200">
              {error}
            </div>
          )}

          {!loading && !error && clips.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-slate-300">
              Search a name, topic, or exact quote to start finding clips.
            </div>
          )}

          {clips.length > 0 && (
            <div className="grid gap-5 md:grid-cols-3">
              {clips.map((clip, index) => {
                const title = clip.clip_title || clip.video_title || "ClipSage Result";
                const quote = clip.quote_text || clip.transcript_chunk || "";
                const href = makeYouTubeUrl(clip);

                return (
                  <a
                    key={clip.id || `${title}-${index}`}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-xl transition duration-200 hover:-translate-y-1 hover:border-yellow-300/30 hover:bg-white/[0.09] hover:shadow-[0_0_35px_rgba(250,204,21,0.12)]"
                  >
                    {clip.thumbnail_url && (
                      <img
                        src={clip.thumbnail_url}
                        alt={title}
                        className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    )}

                    <div className="p-5">
                      <div className="text-xs font-black uppercase tracking-wide text-blue-200">
                        {clip.channel_name || "ClipSage"}
                      </div>

                      <h3 className="mt-2 line-clamp-2 text-lg font-black" style={titleFont}>
                        {title}
                      </h3>

                      <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-300">
                        {quote}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                          {secondsToTimestamp(clip.start_seconds)}
                        </span>

                        <span className="text-sm font-black text-yellow-300">
                          Watch Clip →
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}