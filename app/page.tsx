"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const hasSeenLanding = localStorage.getItem("clipsage_has_seen_landing");

    if (hasSeenLanding === "true") {
      window.location.href = "/app";
      return;
    }

    localStorage.setItem("clipsage_has_seen_landing", "true");
    window.location.href = "/landing";
  }, []);

  return (
    <main className="min-h-screen bg-[#070b12] text-white flex items-center justify-center">
      <p className="text-sm text-slate-400">Loading ClipSage...</p>
    </main>
  );
}