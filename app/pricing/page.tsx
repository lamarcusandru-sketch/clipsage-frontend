"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";

const SUPABASE_URL = "https://sstcthkqleegmvessfxa.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const CHECKOUT_URL =
  "https://sstcthkqleegmvessfxa.supabase.co/functions/v1/create-checkout-session";

const PORTAL_URL =
  "https://sstcthkqleegmvessfxa.supabase.co/functions/v1/create-customer-portal-session";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function PricingPage() {
  const [user, setUser] = useState<User | null>(null);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [premium, setPremium] = useState(false);
  const [checkingPremium, setCheckingPremium] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [message, setMessage] = useState("");

  const authBoxRef = useRef<HTMLDivElement | null>(null);

  const displayName = useMemo(() => {
    if (!user?.email) return "";
    return user.email.split("@")[0];
  }, [user]);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        if (!SUPABASE_ANON_KEY) {
          console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
          if (!mounted) return;
          setPremium(false);
          setCheckingPremium(false);
          return;
        }

        const sessionResult: any = await withTimeout(
          supabase.auth.getSession(),
          4000,
          "Session check timed out"
        );

        if (!mounted) return;

        const currentSession = sessionResult?.data?.session ?? null;
        const currentUser = currentSession?.user ?? null;

        setUser(currentUser);

        if (currentUser) {
          await detectPremium(currentUser);
        } else {
          setPremium(false);
          setCheckingPremium(false);
        }
      } catch (error) {
        console.error("Pricing session load failed:", error);
        if (!mounted) return;
        setPremium(false);
        setCheckingPremium(false);
      }
    }

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        const nextUser = nextSession?.user ?? null;

        setUser(nextUser);

        if (nextUser) {
          setAuthOpen(false);
          await detectPremium(nextUser);
        } else {
          setPremium(false);
          setCheckingPremium(false);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        authBoxRef.current &&
        !authBoxRef.current.contains(event.target as Node)
      ) {
        setAuthOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  async function withTimeout<T>(
  promiseLike: PromiseLike<T>,
  ms: number,
  message: string
): Promise<T> {
  return await Promise.race([
    Promise.resolve(promiseLike),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}

  async function detectPremium(currentUser: User) {
    setCheckingPremium(true);

    try {
      const metadata = currentUser.user_metadata || {};
      const appMetadata = currentUser.app_metadata || {};

      const metadataPremium =
        metadata.is_premium === true ||
        metadata.premium === true ||
        metadata.plan === "paid" ||
        metadata.plan === "premium" ||
        metadata.plan === "premium_plus" ||
        metadata.plan === "premium+" ||
        metadata.subscription_status === "active" ||
        metadata.subscription_status === "trialing" ||
        appMetadata.is_premium === true ||
        appMetadata.premium === true ||
        appMetadata.plan === "paid" ||
        appMetadata.plan === "premium" ||
        appMetadata.plan === "premium_plus" ||
        appMetadata.plan === "premium+" ||
        appMetadata.subscription_status === "active" ||
        appMetadata.subscription_status === "trialing";

      if (metadataPremium) {
        setPremium(true);
        setCheckingPremium(false);
        return;
      }

      const result: any = await withTimeout(
        supabase
          .from("profiles")
          .select("plan, subscription_status")
          .eq("id", currentUser.id)
          .maybeSingle(),
        2500,
        "Premium check timed out"
      );

      const data = result?.data;
      const error = result?.error;

      if (error) {
        console.error("Premium profile check failed:", error);
        setPremium(false);
        setCheckingPremium(false);
        return;
      }

      setPremium(rowLooksPremium(data));
      setCheckingPremium(false);
    } catch (error) {
      console.error("Premium check failed:", error);
      setPremium(false);
      setCheckingPremium(false);
    }
  }

  function rowLooksPremium(row: any) {
    if (!row) return false;

    const status = String(row.status || "").toLowerCase();
    const subscriptionStatus = String(
      row.subscription_status || ""
    ).toLowerCase();
    const plan = String(row.plan || "").toLowerCase();
    const planType = String(row.plan_type || "").toLowerCase();

    return (
      row.is_premium === true ||
      row.premium === true ||
      plan === "paid" ||
      plan === "premium" ||
      plan === "premium_plus" ||
      plan === "premium+" ||
      planType === "premium" ||
      status === "active" ||
      status === "trialing" ||
      status === "paid" ||
      subscriptionStatus === "active" ||
      subscriptionStatus === "trialing" ||
      subscriptionStatus === "paid"
    );
  }

  async function handleAuthSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setMessage("Enter your email and password first.");
      return;
    }

    setAuthLoading(true);

    try {
      if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        setMessage("Account created. Check your email if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        setMessage("Logged in.");
        setAuthOpen(false);
      }
    } catch (error: any) {
      setMessage(error?.message || "Login failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setPremium(false);
    setCheckingPremium(false);
    setMessage("");
  }

  async function getFreshAccessToken() {
    const { data: sessionData } = await supabase.auth.getSession();

    if (sessionData.session?.access_token) {
      return sessionData.session.access_token;
    }

    const { data: refreshData } = await supabase.auth.refreshSession();

    return refreshData.session?.access_token || "";
  }

  async function handleBillingClick() {
    setMessage("");

    const accessToken = await getFreshAccessToken();

    if (!accessToken) {
      setAuthMode("login");
      setAuthOpen(true);
      setMessage("Log in or create an account to upgrade.");
      return;
    }

    const billingUrl = premium ? PORTAL_URL : CHECKOUT_URL;

    setBillingLoading(true);

    try {
      const returnUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/pricing`
          : "https://www.clipsage.org/pricing";

      const response = await fetch(billingUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          returnUrl,
          return_url: returnUrl,
          successUrl: returnUrl,
          success_url: returnUrl,
          cancelUrl: returnUrl,
          cancel_url: returnUrl,
        }),
      });

      const rawText = await response.text();

      let payload: any = null;

      try {
        payload = rawText ? JSON.parse(rawText) : null;
      } catch {
        payload = null;
      }

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            payload?.message ||
            rawText ||
            `Billing request failed with status ${response.status}`
        );
      }

      const redirectUrl =
        payload?.url ||
        payload?.checkout_url ||
        payload?.checkoutUrl ||
        payload?.portal_url ||
        payload?.portalUrl ||
        payload?.session_url ||
        payload?.sessionUrl;

      if (!redirectUrl || typeof redirectUrl !== "string") {
        throw new Error("Stripe did not return a redirect URL.");
      }

      window.location.assign(redirectUrl);
    } catch (error: any) {
      setMessage(error?.message || "Could not open Stripe billing.");
    } finally {
      setBillingLoading(false);
    }
  }

  const ctaText = premium
    ? "Manage Account"
    : "Unlock Smarter + Unlimited Search";

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute right-[-160px] top-[260px] h-[360px] w-[360px] rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute left-[-180px] bottom-[-140px] h-[420px] w-[420px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <a href="/app" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden bg-transparent">
              <img
                src="/logo.png"
                alt="ClipSage logo"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <div className="text-xl font-black tracking-tight">ClipSage</div>
              <div className="text-xs text-zinc-400">
                Find the exact clip. Fast.
              </div>
            </div>
          </a>

          <nav className="flex items-center gap-3">
            <a
              href="/app"
              className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-yellow-400/40 hover:text-yellow-300 sm:inline-flex"
            >
              Back to App
            </a>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <div className="text-xs text-zinc-500">Signed in as</div>
                  <div className="max-w-[180px] truncate text-sm font-semibold text-zinc-200">
                    {displayName}
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/5"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="relative" ref={authBoxRef}>
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setAuthOpen((value) => !value);
                  }}
                  className="rounded-full border border-yellow-400/40 bg-yellow-400 px-4 py-2 text-sm font-black text-black transition hover:bg-yellow-300"
                >
                  Login
                </button>

                {authOpen && (
                  <div className="absolute right-0 top-12 z-50 w-[310px] rounded-3xl border border-white/10 bg-[#101010] p-4 shadow-2xl">
                    <div className="mb-4 flex rounded-full border border-white/10 bg-black/40 p-1">
                      <button
                        type="button"
                        onClick={() => setAuthMode("login")}
                        className={`flex-1 rounded-full px-3 py-2 text-sm font-bold ${
                          authMode === "login"
                            ? "bg-yellow-400 text-black"
                            : "text-zinc-400"
                        }`}
                      >
                        Login
                      </button>

                      <button
                        type="button"
                        onClick={() => setAuthMode("signup")}
                        className={`flex-1 rounded-full px-3 py-2 text-sm font-bold ${
                          authMode === "signup"
                            ? "bg-yellow-400 text-black"
                            : "text-zinc-400"
                        }`}
                      >
                        Sign Up
                      </button>
                    </div>

                    <form onSubmit={handleAuthSubmit} className="space-y-3">
                      <input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        type="email"
                        placeholder="Email"
                        className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/60"
                      />

                      <input
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        type="password"
                        placeholder="Password"
                        className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/60"
                      />

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {authLoading
                          ? "Working..."
                          : authMode === "login"
                          ? "Login"
                          : "Create Account"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </nav>
        </header>

        <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center py-14 text-center">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden bg-transparent">
              <img
                src="/logo.png"
                alt="ClipSage logo"
                className="h-full w-full object-contain drop-shadow-[0_0_35px_rgba(250,204,21,0.25)]"
              />
            </div>
          </div>

          <div className="mb-5 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-bold text-yellow-300">
            ClipSage Pricing
          </div>

          <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
            Search less. Find the moment faster.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            ClipSage helps creators, researchers, podcasters, and clip hunters
            find the exact moments buried inside long YouTube videos.
          </p>

          {message && (
            <div className="mt-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-sm font-semibold text-yellow-200">
              {message}
            </div>
          )}

          <div className="mt-10 grid w-full gap-5 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 text-left shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">Free</h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    Good for trying ClipSage.
                  </p>
                </div>

                <div className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-zinc-300">
                  Starter
                </div>
              </div>

              <div className="mt-7">
                <span className="text-5xl font-black">$0</span>
                <span className="ml-2 text-zinc-500">/ month</span>
              </div>

              <div className="mt-7 space-y-4">
                <Feature>10 searches/day</Feature>
                <Feature>Basic keyword search</Feature>
                <Feature>Good for trying ClipSage</Feature>
                <Feature>Find clips from indexed YouTube videos</Feature>
              </div>

              <a
                href="/app"
                className="mt-8 inline-flex w-full items-center justify-center rounded-2xl border border-white/10 px-5 py-4 text-sm font-black text-zinc-200 transition hover:border-yellow-400/40 hover:bg-yellow-400/10 hover:text-yellow-300"
              >
                Start Searching
              </a>
            </div>

            <div className="relative rounded-[2rem] border border-yellow-400/40 bg-gradient-to-b from-yellow-400/15 to-white/[0.04] p-6 text-left shadow-[0_0_70px_rgba(250,204,21,0.15)]">
              <div className="absolute right-5 top-5 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                Best Value
              </div>

              <div>
                <h2 className="text-2xl font-black">Premium</h2>
                <p className="mt-2 max-w-sm text-sm text-zinc-300">
                  Built for creators, researchers, podcasters, and anyone who
                  needs better clips faster.
                </p>
              </div>

              <div className="mt-7">
                <span className="text-5xl font-black">$10</span>
                <span className="ml-2 text-zinc-500">/ month</span>
              </div>

              <div className="mt-7 space-y-4">
                <Feature>Unlimited searches</Feature>
                <Feature>Smarter search</Feature>
                <Feature>Better results</Feature>
                <Feature>For creators, researchers, and podcasters</Feature>
              </div>

              <button
                type="button"
                onClick={handleBillingClick}
                disabled={billingLoading}
                className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-yellow-400 px-5 py-4 text-sm font-black text-black shadow-[0_0_35px_rgba(250,204,21,0.25)] transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {billingLoading ? "Opening Stripe..." : ctaText}
              </button>

              {checkingPremium && (
                <p className="mt-3 text-center text-xs text-zinc-500">
                  Checking your account status...
                </p>
              )}

              <p className="mt-4 text-center text-xs text-zinc-500">
                {premium
                  ? "You are already premium. Manage your billing anytime."
                  : "Upgrade when you're ready to stop wrestling the haystack."}
              </p>
            </div>
          </div>

          <div className="mt-10 grid w-full gap-4 text-left sm:grid-cols-3">
            <MiniCard
              title="For Creators"
              text="Find b-roll, reactions, quotes, and viral moments without scrubbing for an hour."
            />

            <MiniCard
              title="For Researchers"
              text="Locate the exact section of a long interview, podcast, or commentary video."
            />

            <MiniCard
              title="For Podcasters"
              text="Pull stronger clips from long conversations and turn them into shareable moments."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm font-semibold text-zinc-200">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-black text-black">
        ✓
      </span>
      <span>{children}</span>
    </div>
  );
}

function MiniCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
    </div>
  );
}