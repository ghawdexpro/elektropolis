"use client";

import { useState } from "react";
import { Send, Check, Loader2 } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to subscribe");
      }

      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-[14px] text-green-400">
        <Check className="w-4 h-4" strokeWidth={2} />
        You&apos;re subscribed! Thanks for joining.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 h-11 px-4 bg-white/10 border border-white/15 rounded-lg text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="h-11 px-5 bg-brand hover:bg-brand-hover text-white text-[14px] font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" strokeWidth={1.5} />
          )}
          Subscribe
        </button>
      </div>
      {status === "error" && (
        <p className="text-[12px] text-red-400">{errorMsg}</p>
      )}
    </form>
  );
}
