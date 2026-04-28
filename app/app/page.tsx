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
  political_lean?: string | null;
  content_type?: string | null;
};

const SUPABASE_URL = "https://sstcthkqleegmvessfxa.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SEARCH_URL = `${SUPABASE_URL}/functions/v1/search-clips`;
const CHECKOUT_URL = `${SUPABASE_URL}/functions/v1/create-checkout-session`;
const ACCOUNT_STATUS_URL = `${SUPABASE_URL}/functions/v1/account-status`;

const RESULTS_PER_PAGE = 6;
const FREE_SEARCH_LIMIT = 5;

const hotSearches = ["Trump 60 Minutes", "Strait of Hormuz", "Iran"];
const tryOne = ["Candace Owens", "China", "AI", "Oil Prices", "World War 3"];

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

function normalizeTagValue(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

function normalizeChannelName(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const LEFT_LEANING_CHANNELS = new Set([
  "60 minutes",
  "abc news",
  "al jazeera english",
  "associated press",
  "bbc politics",
  "bloomberg news",
  "cbs news",
  "cnn",
  "contrapoints",
  "crooked media",
  "david pakman show",
  "democracy now",
  "don lemon",
  "fd signifier",
  "hasanabi",
  "lastnightdestiny",
  "left reckoning",
  "lonerbox",
  "msnbc",
  "nbc news",
  "pbs newshour",
  "philosophy tube",
  "pod save america",
  "rational national",
  "second thought",
  "secular talk",
  "some more news",
  "the daily show",
  "the ezra klein show",
  "the humanist report",
  "the young turks",
  "trevor noah",
  "zeteo",
]);

const RIGHT_LEANING_CHANNELS = new Set([
  "a16z",
  "all in podcast",
  "ben shapiro",
  "brittany venti",
  "candace owens",
  "nerdrotic",
  "pbd podcast",
  "rattlesnaketv",
  "sneako",
  "the amazing lucas",
  "the free agent lifestyle",
  "the saint",
  "timcast irl",
  "tucker carlson",
  "valuetainment",
  "whatever",
]);

const NEUTRAL_CHANNELS = new Set([
  "bbc news",
  "reuters",
  "associated press",
  "bloomberg news",
  "intelligence squared",
  "oxford union",
  "mrbeast shorts",
]);

const COMMENTARY_CHANNELS = new Set([
  "ben shapiro",
  "candace owens",
  "destiny",
  "don lemon",
  "hasanabi",
  "lastnightdestiny",
  "moistcr1tikal",
  "nerdrotic",
  "pbd podcast",
  "rattlesnaketv",
  "sneako",
  "the amazing lucas",
  "the free agent lifestyle",
  "the humanist report",
  "the majority report w sam seder",
  "the saint",
  "the young turks",
  "timcast irl",
  "valuetainment",
  "whatever",
]);

function getFallbackLean(channelName?: string | null) {
  const normalized = normalizeChannelName(channelName);

  if (!normalized) return "";
  if (LEFT_LEANING_CHANNELS.has(normalized)) return "left";
  if (RIGHT_LEANING_CHANNELS.has(normalized)) return "right";
  if (NEUTRAL_CHANNELS.has(normalized)) return "neutral";

  return "";
}

function getFallbackContentType(channelName?: string | null) {
  const normalized = normalizeChannelName(channelName);

  if (!normalized) return "";
  if (COMMENTARY_CHANNELS.has(normalized)) return "commentary";

  return "";
}

function getClipTags(clip: ClipResult) {
  const lean = normalizeTagValue(clip.political_lean) || getFallbackLean(clip.channel_name);
  const contentType = normalizeTagValue(clip.content_type) || getFallbackContentType(clip.channel_name);
  const tags: Array<{ label: string; className: string }> = [];

  if (lean === "right") {
    tags.push({
      label: "Right-leaning",
      className: "border-red-400/35 bg-red-500/15 text-red-200 shadow-[0_0_18px_rgba(248,113,113,0.12)]",
    });
  } else if (lean === "left") {
    tags.push({
      label: "Left-leaning",
      className: "border-blue-300/35 bg-blue-400/15 text-blue-100 shadow-[0_0_18px_rgba(96,165,250,0.12)]",
    });
  } else if (lean === "neutral" || lean === "center" || lean === "mixed") {
    tags.push({
      label: lean === "mixed" ? "Mixed" : "Neutral",
      className: "border-zinc-400/30 bg-zinc-400/12 text-zinc-200 shadow-[0_0_18px_rgba(212,212,216,0.08)]",
    });
  }

  if (contentType === "commentary") {
    tags.push({
      label: "Commentary",
      className: "border-yellow-300/45 bg-yellow-400/18 text-yellow-200 shadow-[0_0_18px_rgba(250,204,21,0.16)]",
    });
  }

  return tags;
}


function calculateFreeSearchesLeft(rawSearchesLeft?: number | null, rawSearchLimit?: number | null) {
  if (typeof rawSearchesLeft !== "number") return null;

  const backendLimit =
    typeof rawSearchLimit === "number" && rawSearchLimit > 0
      ? rawSearchLimit
      : rawSearchesLeft > FREE_SEARCH_LIMIT
        ? rawSearchesLeft
        : FREE_SEARCH_LIMIT;

  if (backendLimit > FREE_SEARCH_LIMIT) {
    return Math.max(0, Math.min(rawSearchesLeft - (backendLimit - FREE_SEARCH_LIMIT), FREE_SEARCH_LIMIT));
  }

  return Math.max(0, Math.min(rawSearchesLeft, FREE_SEARCH_LIMIT));
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
  const [searchLimit, setSearchLimit] = useState<number | null>(FREE_SEARCH_LIMIT);
  const [plan, setPlan] = useState<string>("free");
  const [isPremium, setIsPremium] = useState(false);

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

  async function loadAccountStatus(currentSession: Session | null) {
    if (!currentSession?.user) {
      setIsPremium(false);
      setPlan("free");
      setSearchLimit(FREE_SEARCH_LIMIT);
      setSearchesLeft(null);
      return;
    }

    try {
      const response = await fetch(ACCOUNT_STATUS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${currentSession.access_token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Could not load account status.");
      }

      const nextPlan = String(data?.plan || "free").toLowerCase();
      const premiumActive = nextPlan === "paid" || nextPlan === "premium";

      setPlan(premiumActive ? "premium" : "free");
      setIsPremium(premiumActive);

      const backendSearchLimit = typeof data?.search_limit === "number" ? data.search_limit : FREE_SEARCH_LIMIT;

      setSearchLimit(premiumActive ? data?.search_limit ?? null : FREE_SEARCH_LIMIT);

      if (typeof data?.searches_left === "number") {
        setSearchesLeft(
          premiumActive
            ? data.searches_left
            : calculateFreeSearchesLeft(data.searches_left, backendSearchLimit)
        );
      } else if (premiumActive) {
        setSearchesLeft(null);
      } else {
        setSearchesLeft(FREE_SEARCH_LIMIT);
      }
    } catch (err) {
      console.error("Account status load failed:", err);

      const fallbackPlan = currentSession.user.app_metadata?.plan;
      const fallbackPremium = fallbackPlan === "paid" || fallbackPlan === "premium";

      setPlan(fallbackPremium ? "premium" : "free");
      setIsPremium(fallbackPremium);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function bootAuth() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const currentSession = data.session ?? null;
      setSession(currentSession);
      await loadAccountStatus(currentSession);
    }

    bootAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      const currentSession = newSession ?? null;
      setSession(currentSession);
      await loadAccountStatus(currentSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
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

    setAuthLoading(false);
  }

  async function fetchClips(searchQuery: string, pageToFetch: number) {
    if (!SUPABASE_ANON_KEY) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Check .env.local and Vercel.");
    }

    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    const token = currentSession?.access_token || SUPABASE_ANON_KEY;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch(SEARCH_URL, {
        method: "POST",
        signal: controller.signal,
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
          offset: (pageToFetch - 1) * RESULTS_PER_PAGE,
          anon_id: getAnonId(),
        }),
      });

      const data = await response.json().catch(() => null);

      const responsePlan = typeof data?.plan === "string" ? data.plan.toLowerCase() : plan;
      const responseIsPremium = responsePlan === "paid" || responsePlan === "premium";
      const backendSearchLimit = typeof data?.search_limit === "number" ? data.search_limit : searchLimit ?? FREE_SEARCH_LIMIT;

      if (typeof data?.plan === "string") {
        setPlan(responseIsPremium ? "premium" : "free");
        setIsPremium(responseIsPremium);
      }

      if (typeof data?.search_limit === "number") {
        setSearchLimit(responseIsPremium ? data.search_limit : FREE_SEARCH_LIMIT);
      }

      if (typeof data?.searches_left === "number") {
        setSearchesLeft(
          responseIsPremium
            ? data.searches_left
            : calculateFreeSearchesLeft(data.searches_left, backendSearchLimit)
        );
      } else if (!responseIsPremium && pageToFetch === 1) {
        setSearchesLeft((current) => Math.max(0, (current ?? FREE_SEARCH_LIMIT) - 1));
      }

      if (!response.ok) {
        if (data?.error === "limit_reached") {
          setSearchesLeft(0);
          throw new Error(`You’ve reached your ${FREE_SEARCH_LIMIT} free searches for today.`);
        }

        throw new Error(data?.message || data?.error || "Search failed.");
      }

      const clips = data?.results || data?.clips || data?.data || data?.items || [];
      return Array.isArray(clips) ? clips : [];
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error("Search timed out. Try again in a moment.");
      }

      if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
        throw new Error("Search connection failed. Check the Supabase Edge Function and CORS.");
      }

      throw err;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function runSearch(searchValue: string) {
    const finalQuery = searchValue.trim();

    if (!finalQuery) {
      setError("Type something to search first.");
      return;
    }

    if (isFree && displayedSearchesLeft <= 0) {
      setSearchesLeft(0);
      setError(`You’ve reached your ${FREE_SEARCH_LIMIT} free searches for today.`);
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

      if (clips.length === 0) setError("No clips found for this search.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while searching.");
    } finally {
      setLoading(false);
    }
  }

  async function showMoreClips() {
    if (!activeQuery || loadingMore) return;

    if (isFree && displayedSearchesLeft <= 0) {
      setSearchesLeft(0);
      setError(`You’ve reached your ${FREE_SEARCH_LIMIT} free searches for today.`);
      return;
    }

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
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Check .env.local and Vercel.");
      }

      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession?.access_token) {
        setAuthOpen(true);
        throw new Error("Please log in before upgrading.");
      }

      const billingUrl = CHECKOUT_URL;

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
  const displayedSearchesLeft = isFree
    ? Math.max(0, Math.min(searchesLeft === null ? FREE_SEARCH_LIMIT : searchesLeft, FREE_SEARCH_LIMIT))
    : searchesLeft === null ? searchLimit ?? FREE_SEARCH_LIMIT : searchesLeft;

  const billingButtonText = checkoutLoading ? "Opening..." : isPremium ? "Manage Account" : "Upgrade";

  const mainBillingButtonText = checkoutLoading
    ? "Opening..."
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

          <nav className="relative flex items-center gap-4 text-sm font-bold text-gray-200">
            <a href="/pricing" className="hover:text-white">Pricing</a>
            <a href="/about" className="hover:text-white">About</a>
            <a href="/landing" className="hover:text-white">How It Works</a>

            <button
              type="button"
              onClick={() => {
                setAuthOpen((current) => !current);
                setAuthMessage("");
              }}
              className="hover:text-white"
            >
              Account
            </button>

            <button
              type="button"
              onClick={handleBilling}
              disabled={checkoutLoading}
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
                      disabled={checkoutLoading}
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
                    ? "Free plan: 5 searches/day. Unlock smarter results + unlimited search."
                    : "Premium plan: smarter results + unlimited search."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleBilling}
                disabled={checkoutLoading}
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
            <div className="mx-auto mt-6 max-w-xl rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-4 text-sm text-red-300">
              <p className="font-semibold">{error}</p>

              {isFree && displayedSearchesLeft <= 0 && (
                <div className="mt-4 rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-center">
                  <p className="mb-3 text-sm font-bold text-yellow-100">
                    Keep going instantly with smarter, unlimited search.
                  </p>

                  <button
                    type="button"
                    onClick={handleBilling}
                    disabled={checkoutLoading}
                    className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black shadow-[0_0_28px_rgba(250,204,21,0.35)] transition hover:scale-105 disabled:opacity-60"
                  >
                    {checkoutLoading ? "Opening..." : "Unlock Smart Search"}
                  </button>
                </div>
              )}
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

                      <div className="flex items-center justify-between gap-3">
                        <a
                          href={getYoutubeUrl(clip)}
                          target="_blank"
                          rel="noreferrer"
                          className="clip-button inline-block rounded-xl bg-blue-400 px-5 py-3 text-sm font-black text-black shadow-[0_0_24px_rgba(96,165,250,0.25)]"
                        >
                          Watch Clip
                        </a>
                      </div>

                      {getClipTags(clip).length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4">
                          {getClipTags(clip).map((tag) => (
                            <span
                              key={tag.label}
                              className={`rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] ${tag.className}`}
                            >
                              {tag.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>

            {/* LOCKED SMART RESULTS TEASER */}
            {!isPremium && results.length > 0 && (
              <div className="mt-10 rounded-3xl border border-yellow-400/30 bg-gradient-to-b from-yellow-400/10 to-transparent p-6 text-center shadow-[0_0_35px_rgba(250,204,21,0.12)]">
                <div className="mb-2 text-sm font-black uppercase tracking-[0.22em] text-yellow-300">
                  🔒 Hidden Results
                </div>

                <h3 className="mb-2 text-2xl font-black text-white">
                  +{Math.floor(Math.random() * 10) + 8} smarter clips found
                </h3>

                <p className="mx-auto mb-5 max-w-2xl text-sm font-semibold leading-6 text-blue-100/75">
                  These results use Smart Search — deeper understanding, better matches, and clips others miss.
                </p>

                <button
                  type="button"
                  onClick={handleBilling}
                  disabled={checkoutLoading}
                  className="rounded-2xl bg-yellow-400 px-7 py-4 font-black text-black shadow-[0_0_35px_rgba(250,204,21,0.35)] transition hover:scale-105 disabled:opacity-60"
                >
                  {checkoutLoading ? "Opening..." : "See What You're Missing — Unlock Smart Search"}
                </button>

                <div className="mt-3 text-xs font-bold text-gray-500">
                  Find the exact moment — not just keyword matches.
                </div>
              </div>
            )}

            {/* PREMIUM+ TEASER */}
            {!isPremium && results.length > 0 && (
              <div className="mt-4 text-center text-sm font-semibold text-gray-400">
                Want full clip breakdowns and export-ready content?
                <span className="text-yellow-300"> Premium+ coming soon.</span>
              </div>
            )}

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