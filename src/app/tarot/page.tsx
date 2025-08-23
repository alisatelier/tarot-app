'use client'

import dynamic from "next/dynamic";

const TarotCanvas = dynamic(() => import("../../components/tarot/TarotCanvas"), { ssr: false });

export default function TarotPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <h1 className="text-3xl font-semibold mb-2">Interactive Tarot</h1>
      <p className="text-neutral-600 mb-6">
        Choose a spread, deal from your deck, flip cards, and save readings.
      </p>
      <TarotCanvas />
    </main>
  );
}
