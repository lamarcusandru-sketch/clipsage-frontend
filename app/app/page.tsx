"use client";

import { useEffect, useState } from "react";
import { createClient, Session } from "@supabase/supabase-js";

type ClipResult = {
  id?: string;
  channel_name?: string;
  video_title?: string;
  clip_title?: string;
  title?: string;
  quote_text?: string;
  transcript_chunk?: string;
  start_seconds?: number;
  end_seconds?: number;
  thumbnail_url?: string;
  youtube_video_id?: string;
  video_url?: string;
};

type AnyRow = Record<string, any>;

const SUPABASE_URL = "https://sstcthkqleegmvessfxa.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SEARCH_URL = `${SUPABASE_URL}/functions/v1/search-clips`;
const CHECKOUT_URL = `${SUPABASE_URL}/functions/v1/create-checkout-session`;
const PORTAL_URL = `${SUPABASE_URL}/functions/v1/create-customer-portal-session`;

const RESULTS_PER_PAGE = 6;

const hotSearches = ["War", "Ceasefire", "Iran"];
const tryOne = ["Trump", "Iran Ceasefire", "Israel AI", "Oil Prices", "AI Revolution"];

const loadingMessages = [
  "Searching through the transcript vault...",
  "Matching your query to exact video moments...",
  "Ranking the strongest clips now...",
];

function formatTime(seconds?: number) {
  if (!seconds && seconds !== 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getAnonId() {
  const existingId = localStorage.getItem("clipsage_anon_id");
  if (existingId) return existingId;

  const newId = crypto.randomUUID();
  localStorage.setItem("clipsage_anon_id", newId);
  return newId;
}

function getYoutubeUrl(clip: ClipResult) {
  const start = clip.start_seconds || 0;

  if (clip.youtube_video_id) {
    return `https://www.youtube.com/watch?v=${clip.youtube_video_id}&t=${start}s`;
  }

  if (clip.video_url) {
    return `${clip.video_url}${clip.video_url.includes("?") ? "&" : "?"}t=${start}s`;
  }

  return "#";
}

function rowLooksPremium(row: AnyRow | null) {
  if (!row) return false;

  const status = String(
    row.subscription_status ||
      row.status ||
      row.stripe_subscription_status ||
      ""
  ).toLowerCase();

  const plan = String(row.plan || row.tier || row.account_type || "").toLowerCase();

  return Boolean(
    row.is_premium === true ||
      row.premium === true ||
      row.is_paid === true ||
      row.has_premium === true ||
      plan === "premium" ||
      plan === "paid" ||
      plan === "pro" ||
      status === "active" ||
      status === "trialing" ||
      status === "paid"
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getHighlightTerms(query: string) {
  return query
    .trim()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 1);
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const terms = getHighlightTerms(query);

  if (!text || terms.length === 0) return <>{text}</>;

  const regex = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        const isMatch = terms.some((term) => term.toLowerCase() === part.toLowerCase());

        if (!isMatch) return <span key={index}>{part}</span>;

        return (
          <mark key={index} className="rounded-md bg-yellow-400 px-1 font-black text-black">
            {part}
          </mark>
        );
      })}
    </>
  );
}

export default function ClipSageApp() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [results, setResults] = useState<ClipResult[]>([]);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const [error, setError] = useState("");
  const [animationKey, setAnimationKey] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const [searchesLeft, setSearchesLeft] = useState<number | null>(null);
  const [searchLimit, setSearchLimit] = useState<number | null>(10);
  const [plan, setPlan] = useState<string>("free");
  const [isPremium, setIsPremium] = useState(false);
  const [premiumChecked, setPremiumChecked] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!loading && !loadingMore) {
      setLoadingMessageIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingMessageIndex((current) => (current + 1) % loadingMessages.length);
    }, 1600);

    return () => window.clearInterval(timer);
  }, [loading, loadingMore]);

  async function checkTableForPremium(table: string, column: string, value: string) {
    const { data, error } = await supabase.from(table).select("*").eq(column, value).maybeSingle();
    if (error || !data) return false;
    return rowLooksPremium(data);
  }

  async function refreshPremiumStatus(currentSession?: Session | null) {
    setPremiumChecked(false);

    const workingSession = currentSession ?? session;

    if (!workingSession?.user?.id) {
      setIsPremium(false);
      setPlan("free");
      setPremiumChecked(true);
      return false;
    }

    const userId = workingSession.user.id;
    const userEmail = workingSession.user.email || "";

    const metadataPremium =
      rowLooksPremium(workingSession.user.user_metadata || {}) ||
      rowLooksPremium(workingSession.user.app_metadata || {});

    if (metadataPremium) {
      setIsPremium(true);
      setPlan("premium");
      setPremiumChecked(true);
      return true;
    }

    try {
      const checks = [
        checkTableForPremium("profiles", "id", userId),
        checkTableForPremium("profiles", "user_id", userId),
        userEmail ? checkTableForPremium("profiles", "email", userEmail) : Promise.resolve(false),
        checkTableForPremium("customers", "user_id", userId),
        userEmail ? checkTableForPremium("customers", "email", userEmail) : Promise.resolve(false),
        checkTableForPremium("subscriptions", "user_id", userId),
        userEmail ? checkTableForPremium("subscriptions", "email", userEmail) : Promise.resolve(false),
      ];

      const settled = await Promise.allSettled(checks);
      const premium = settled.some((item) => item.status === "fulfilled" && item.value === true);

      setIsPremium(premium);
      setPlan(premium ? "premium" : "free");

      return premium;
    } catch {
      setIsPremium(false);
      setPlan("free");
      return false;
    } finally {
      setPremiumChecked(true);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function bootAuth() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const currentSession = data.session ?? null;
      setSession(currentSession);
      await refreshPremiumStatus(currentSession);
    }

    bootAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      const currentSession = newSession ?? null;
      setSession(currentSession);
      await refreshPremiumStatus(currentSession);
    });

    const handleFocus = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      await refreshPremiumStatus(data.session ?? null);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  async function handleAuthSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setAuthLoading(true);
    setAuthMessage("");
    setError("");

    try {
      if (!authEmail.trim() || !authPassword.trim()) {
        throw new Error("Enter your email and password.");
      }

      if (authMode === "signup") {
        const { error: signupError } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
        });

        if (signupError) throw signupError;

        setAuthMessage("Account created. Check your email if confirmation is required.");
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });

        if (loginError) throw loginError;

        setSession(data.session ?? null);
        await refreshPremiumStatus(data.session ?? null);

        setAuthMessage("Logged in.");
        setAuthOpen(false);
      }
    } catch (err) {
      setAuthMessage(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    setAuthLoading(true);
    setAuthMessage("");

    await supabase.auth.signOut();

    setSession(null);
    setIsPremium(false);
    setPlan("free");
    setPremiumChecked(true);

    setAuthLoading(false);
  }

  async function fetchClips(searchQuery: string, pageToFetch: number) {
    if (!SUPABASE_ANON_KEY) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    }

    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    const token = currentSession?.access_token || SUPABASE_ANON_KEY;

    const response = await fetch(SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: searchQuery,
        q: searchQuery,
        limit: RESULTS_PER_PAGE,
        page: pageToFetch,
        anon_id: getAnonId(),
      }),
    });

    const data = await response.json().catch(() => null);

    if (typeof data?.searches_left === "number") setSearchesLeft(data.searches_left);
    if (typeof data?.search_limit === "number") setSearchLimit(data.search_limit);

    if (typeof data?.plan === "string") {
      setPlan(data.plan);
      setIsPremium(data.plan !== "free");
    }

    if (!response.ok) {
      if (data?.error === "limit_reached") {
        setSearchesLeft(0);
        throw new Error(data?.message || "You’ve reached your 10 free searches for today.");
      }

      throw new Error(data?.message || data?.error || "Search failed.");
    }

    const clips = data?.results || data?.clips || data?.data || data?.items || [];
    return Array.isArray(clips) ? clips : [];
  }

  async function runSearch(searchValue: string) {
    const finalQuery = searchValue.trim();

    if (!finalQuery) {
      setError("Type something to search first.");
      return;
    }

    setQuery(finalQuery);
    setActiveQuery(finalQuery);
    setLoading(true);
    setLoadingMore(false);
    setError("");
    setResults([]);
    setPage(1);
    setHasSearched(true);
    setLoadingMessageIndex(0);

    try {
      const clips = await fetchClips(finalQuery, 1);
      setResults(clips);
      setAnimationKey((current) => current + 1);

      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      await refreshPremiumStatus(currentSession ?? null);

      if (clips.length === 0) setError("No clips found for this search.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while searching.");
    } finally {
      setLoading(false);
    }
  }

  async function showMoreClips() {
    if (!activeQuery || loadingMore) return;

    const nextPage = page + 1;

    setLoadingMore(true);
    setError("");
    setLoadingMessageIndex(0);

    try {
      const clips = await fetchClips(activeQuery, nextPage);

      if (clips.length === 0) {
        setError("No more clips found for this search.");
        return;
      }

      setResults(clips);
      setPage(nextPage);
      setAnimationKey((current) => current + 1);

      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      await refreshPremiumStatus(currentSession ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while loading more clips.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleBilling() {
    try {
      setError("");
      setCheckoutLoading(true);

      if (!SUPABASE_ANON_KEY) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      }

      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw new Error(sessionError.message || "Could not get login session.");

      if (!currentSession?.access_token) {
        setAuthOpen(true);
        throw new Error("Please log in before upgrading.");
      }

      const premiumNow = await refreshPremiumStatus(currentSession);
      const billingUrl = premiumNow ? PORTAL_URL : CHECKOUT_URL;

      const response = await fetch(billingUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${currentSession.access_token}`,
        },
        body: JSON.stringify({
          return_url: `${window.location.origin}/app`,
          success_url: `${window.location.origin}/app?checkout=success`,
          cancel_url: `${window.location.origin}/app?checkout=cancelled`,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Could not open billing.");
      }

      const finalUrl =
        data?.url ||
        data?.checkout_url ||
        data?.portal_url ||
        data?.session?.url;

      if (!finalUrl) throw new Error("Billing URL was not returned.");

      window.location.href = finalUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong opening billing.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    runSearch(query);
  }

  function handleSuggestedSearch(term: string) {
    runSearch(term);
  }

  const isFree = !isPremium && plan === "free";
  const displayedSearchesLeft = searchesLeft === null ? searchLimit ?? 10 : searchesLeft;

  const billingButtonText = checkoutLoading
    ? "Opening..."
    : !premiumChecked
      ? "Checking..."
      : isPremium
        ? "Manage Account"
        : "Upgrade";

  const mainBillingButtonText = checkoutLoading
    ? "Opening..."
    : !premiumChecked
      ? "Checking Account..."
      : isPremium
        ? "Manage Account"
        : "Unlock Smarter + Unlimited Search";

  return (
    <main className="min-h-screen bg-[#080b12] px-6 py-6 text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@700;800&display=swap');

        .hero-title {
          font-family: 'Fredoka', Arial, sans-serif;
          letter-spacing: -0.045em;
        }

        @keyframes clipCardPop {
          0% { opacity: 0; transform: translateY(26px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes thinkingPulse {
          0% { opacity: 0.55; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-1px); }
          100% { opacity: 0.55; transform: translateY(0); }
        }

        .loading-message {
          animation: thinkingPulse 1300ms ease-in-out infinite;
        }

        .clip-card {
          overflow: hidden;
          animation: clipCardPop 420ms ease-out both;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025)),
            #0b1018;
          border: 1px solid rgba(63, 72, 88, 0.9);
          box-shadow: 0 18px 40px rgba(0,0,0,0.32);
          transition:
            transform 220ms ease-out,
            border-color 220ms ease-out,
            box-shadow 220ms ease-out,
            background-color 220ms ease-out;
        }

        .clip-card:hover {
          transform: translateY(-14px) scale(1.045) !important;
          border-color: #facc15 !important;
          box-shadow: 0 0 55px rgba(250, 204, 21, 0.34) !important;
          background-color: #09090b !important;
          z-index: 20;
        }

        .clip-card img {
          transition: transform 220ms ease-out;
        }

        .clip-card:hover img {
          transform: scale(1.08);
        }

        .clip-button {
          transition:
            transform 180ms ease-out,
            border-color 180ms ease-out,
            background-color 180ms ease-out;
        }

        .clip-button:hover {
          transform: scale(1.05);
          border-color: #facc15 !important;
        }
      `}</style>

      <div className="mx-auto max-w-6xl">
        <header className="relative mb-12 flex items-center justify-between">
          <a href="/app" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="ClipSage Logo"
              className="h-11 w-auto rounded-full drop-shadow-[0_0_18px_rgba(96,165,250,0.35)]"
            />

            <div className="leading-tight">
              <div className="text-2xl font-black tracking-tight">ClipSage</div>
              <div className="text-xs text-blue-100">
                Find exact moments inside podcasts, interviews, and videos
              </div>
            </div>
          </a>

          <nav className="relative flex items-center gap-4 text-sm text-gray-200">
            <a href="/pricing" className="hover:text-white">
              Pricing
            </a>

            <a href="/about" className="hover:text-white">
              About
            </a>

            <a href="/landing" className="hover:text-white">
              How It Works
            </a>

            <button
              type="button"
              onClick={() => {
                setAuthOpen((current) => !current);
                setAuthMessage("");
              }}
              className="hover:text-white"
            >
              {session?.user?.email ? "Account" : "Log In"}
            </button>

            <button
              type="button"
              onClick={handleBilling}
              disabled={checkoutLoading || !premiumChecked}
              className="rounded-xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:scale-105 disabled:opacity-60"
            >
              {billingButtonText}
            </button>

            {authOpen && (
              <div className="absolute right-0 top-14 z-50 w-80 rounded-2xl border border-zinc-800 bg-[#101520] p-5 text-left shadow-2xl">
                {session?.user?.email ? (
                  <>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                      Signed In
                    </p>

                    <p className="mb-2 break-all text-sm text-blue-100">
                      {session.user.email}
                    </p>

                    <p className="mb-4 text-sm font-bold text-yellow-300">
                      {isPremium ? "Premium Active" : "Free Account"}
                    </p>

                    <button
                      type="button"
                      onClick={handleBilling}
                      disabled={checkoutLoading || !premiumChecked}
                      className="mb-3 w-full rounded-xl bg-yellow-400 px-4 py-3 font-bold text-black transition hover:scale-[1.02] disabled:opacity-60"
                    >
                      {mainBillingButtonText}
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={authLoading}
                      className="w-full rounded-xl bg-white px-4 py-3 font-bold text-black transition hover:scale-[1.02] disabled:opacity-60"
                    >
                      {authLoading ? "Signing Out..." : "Sign Out"}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("login");
                          setAuthMessage("");
                        }}
                        className={`flex-1 rounded-xl px-3 py-2 font-bold ${
                          authMode === "login"
                            ? "bg-blue-400 text-black"
                            : "bg-white/[0.06] text-gray-200"
                        }`}
                      >
                        Log In
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("signup");
                          setAuthMessage("");
                        }}
                        className={`flex-1 rounded-xl px-3 py-2 font-bold ${
                          authMode === "signup"
                            ? "bg-blue-400 text-black"
                            : "bg-white/[0.06] text-gray-200"
                        }`}
                      >
                        Sign Up
                      </button>
                    </div>

                    <form onSubmit={handleAuthSubmit} className="space-y-3">
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full rounded-xl border border-zinc-700 bg-[#080b12] px-4 py-3 text-white outline-none focus:border-blue-400"
                      />

                      <input
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full rounded-xl border border-zinc-700 bg-[#080b12] px-4 py-3 text-white outline-none focus:border-blue-400"
                      />

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full rounded-xl bg-yellow-400 px-4 py-3 font-black text-black transition hover:scale-[1.02] disabled:opacity-60"
                      >
                        {authLoading
                          ? "Working..."
                          : authMode === "login"
                            ? "Log In"
                            : "Create Account"}
                      </button>
                    </form>

                    {authMessage && (
                      <p className="mt-3 rounded-xl border border-zinc-800 bg-white/[0.04] px-3 py-2 text-sm text-blue-100">
                        {authMessage}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </nav>
        </header>

        <section className="mx-auto mb-16 max-w-5xl text-center">
          <img
            src="/logo.png"
            alt="ClipSage Logo"
            className="mx-auto mb-6 h-32 w-auto drop-shadow-[0_0_28px_rgba(96,165,250,0.35)]"
          />

          <h1 className="hero-title mb-6 text-5xl font-black leading-[0.92] md:text-7xl">
            Find the exact moment that
            <br />
            matters.
          </h1>

          <p className="mx-auto mb-10 max-w-3xl text-lg leading-8 text-blue-100">
            Search podcasts, interviews, and long-form videos to pull up the exact part you need in seconds.
            Built for podcast lovers, creators, and researchers!
          </p>

          <div className="mx-auto mb-8 max-w-4xl text-left">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
              Featured Hot Searches
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              {hotSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSuggestedSearch(term)}
                  disabled={loading || loadingMore}
                  className="rounded-2xl border border-zinc-800 bg-white/[0.04] p-5 text-left transition hover:-translate-y-1 hover:border-yellow-400 hover:bg-white/[0.07] disabled:opacity-50"
                >
                  <div className="mb-3 text-xs font-black uppercase tracking-wider text-blue-200">
                    Hot Search
                  </div>
                  <div className="text-lg font-black">{term}</div>
                  <div className="mt-1 text-sm text-blue-100">See clips in seconds!</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-800 bg-white/[0.05] p-5 shadow-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                value={query}
                placeholder="Try: Ceasefire"
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 rounded-2xl border border-zinc-800 bg-[#0b0f18] px-6 py-5 text-lg text-white outline-none placeholder:text-gray-500 focus:border-blue-400"
              />

              <button
                type="submit"
                disabled={loading || loadingMore}
                className="rounded-2xl bg-blue-400 px-8 py-5 font-black text-black shadow-[0_0_30px_rgba(96,165,250,0.35)] transition hover:scale-105 disabled:opacity-60"
              >
                {loading ? "Finding..." : "Find Clips"}
              </button>
            </form>

            <div className="mt-5 grid gap-5 text-left md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-bold text-white">
                  Search for a moment, not a video.{" "}
                  <span className="font-normal text-gray-400">
                    Try a name, topic, or exact quote.
                  </span>
                </p>

                <p className="mt-4 text-lg font-black text-white">
                  {isFree ? `${displayedSearchesLeft} free searches left` : "Unlimited search unlocked"}
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  {isFree
                    ? "Free plan: 10 searches/day. Unlock smarter results + unlimited search."
                    : "Premium plan: smarter results + unlimited search."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleBilling}
                disabled={checkoutLoading || !premiumChecked}
                className="rounded-2xl bg-yellow-400 px-7 py-4 font-black text-black shadow-[0_0_35px_rgba(250,204,21,0.45)] transition hover:scale-105 disabled:opacity-60"
              >
                {mainBillingButtonText}
              </button>
            </div>

            <div className="mt-6 text-left">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-gray-500">
                Try One
              </p>

              <div className="flex flex-wrap gap-2">
                {tryOne.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSuggestedSearch(term)}
                    disabled={loading || loadingMore}
                    className="rounded-full border border-zinc-700 bg-white/[0.08] px-4 py-2 text-sm font-bold text-gray-200 transition hover:scale-105 hover:border-yellow-400 hover:text-white disabled:opacity-50"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(loading || loadingMore) && (
            <div className="loading-message mx-auto mt-6 max-w-xl rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-4 text-sm font-black text-yellow-200">
              {loadingMessages[loadingMessageIndex]}
            </div>
          )}

          {error && (
            <div className="mx-auto mt-6 max-w-xl rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </section>

        {!hasSearched && !loading && (
          <section className="mb-10">
            <p className="mb-4 font-bold text-blue-100">
              Search a name, topic, or quote to find exact clips in seconds.
            </p>

            <div className="rounded-2xl border border-zinc-800 bg-white/[0.04] px-6 py-7 text-blue-100">
              Search a name, topic, or exact quote to start finding clips.
            </div>
          </section>
        )}

        {loading && (
          <section className="grid gap-7 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-2xl border border-zinc-800 bg-white/[0.04]"
              />
            ))}
          </section>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="mb-5 font-bold text-blue-100">
              Showing {results.length} clips for "{activeQuery}"
            </p>

            <section key={animationKey} className="grid gap-7 md:grid-cols-3">
              {results.map((clip, index) => {
                const cardTitle =
                  clip.clip_title ||
                  clip.title ||
                  clip.video_title ||
                  "Untitled Clip";

                const transcript =
                  clip.quote_text ||
                  clip.transcript_chunk ||
                  "No transcript preview available.";

                return (
                  <article
                    key={`${clip.id || "clip"}-${clip.youtube_video_id || "video"}-${clip.start_seconds || 0}-${index}`}
                    className="clip-card rounded-3xl"
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <div className="aspect-video overflow-hidden bg-zinc-900">
                      {clip.thumbnail_url ? (
                        <img
                          src={clip.thumbnail_url}
                          alt={cardTitle}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-600">
                          No thumbnail
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h2 className="mb-4 line-clamp-2 text-xl font-black leading-snug text-white">
                        {cardTitle}
                      </h2>

                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-blue-300/20 bg-blue-400/15 px-3 py-2 text-xs font-black text-blue-100">
                          {formatTime(clip.start_seconds)} - {formatTime(clip.end_seconds)}
                        </span>

                        <span className="line-clamp-1 text-sm font-bold text-gray-400">
                          {clip.channel_name || "Unknown Channel"}
                        </span>
                      </div>

                      <p className="mb-5 line-clamp-6 text-[15px] font-semibold leading-7 text-blue-100/80">
                        <HighlightedText text={transcript} query={activeQuery || query} />
                      </p>

                      <a
                        href={getYoutubeUrl(clip)}
                        target="_blank"
                        rel="noreferrer"
                        className="clip-button inline-block rounded-xl bg-blue-400 px-5 py-3 text-sm font-black text-black shadow-[0_0_24px_rgba(96,165,250,0.25)]"
                      >
                        Watch Clip
                      </a>
                    </div>
                  </article>
                );
              })}
            </section>

            {hasSearched && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={showMoreClips}
                  disabled={loadingMore}
                  className="rounded-xl bg-yellow-400 px-8 py-4 font-bold text-black transition hover:scale-105 disabled:opacity-60"
                >
                  {loadingMore ? "Loading New Clips..." : "Show More Clips"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}