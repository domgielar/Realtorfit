"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function GatePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/gate/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[--color-paper] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold text-[--color-ink] mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            RealtorFit
          </h1>
          <p className="text-[--color-ink-soft] text-sm">
            This preview is invite-only. Enter your access code to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access code"
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-[--color-line] bg-white text-[--color-ink] placeholder:text-[--color-muted] focus:outline-none focus:ring-2 focus:ring-[--color-clay] text-center tracking-widest text-lg"
          />

          {error && (
            <p className="text-sm text-center text-red-500">
              Incorrect code — try again.
            </p>
          )}

          <button
            type="submit"
            disabled={!code || loading}
            className="w-full py-3 rounded-xl bg-[--color-clay] text-white font-semibold text-sm hover:bg-[--color-clay-deep] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
