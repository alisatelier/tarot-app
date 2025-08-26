"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import SelectorBar from "../components/tarot/layouts/SelectorBar";

const TarotCanvas = dynamic(() => import("../components/tarot/TarotCanvas"), {
  ssr: false,
  loading: () => (
    <div className="card p-6">
      <div className="h-6 w-40 rounded bg-[var(--panel-border)]/20 mb-3" />
      <div className="h-[50vh] rounded-2xl border border-[var(--panel-border)]/60 bg-[var(--panel)]" />
      <p className="mt-3 text-xs text-[var(--ink-50)]">Loading the canvas…</p>
    </div>
  ),
});

export default function TarotPage() {
  return (
    <main className="min-h-[100svh]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <h1
            className="text-2xl sm:text-3xl font-semibold"
            style={{ color: "var(--brand-navy)" }}
          >
            Tarot Pull
          </h1>
          <p className="mt-1 text-[var(--ink-70)]">
            Set your question, choose a spread & deck color, then begin your
            pull.
          </p>
        </header>

        {/* Main panel */}
        <section className="card p-4 sm:p-6">
          <SelectorBar />
          <TarotCanvas />
        </section>
      </div>
    </main>
  );
}
