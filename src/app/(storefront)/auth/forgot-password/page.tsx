"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/account/reset-password`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-16 md:py-24 bg-surface">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <h1 className="text-[28px] font-bold text-charcoal tracking-tight">
              Elektro<span className="text-brand">Polis</span>
            </h1>
          </Link>
          <p className="text-[14px] text-muted mt-2">
            Reset your password
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          {success ? (
            /* ── Success state ─────────────────── */
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-7 h-7 text-success" strokeWidth={1.5} />
              </div>
              <h2 className="text-[18px] font-semibold text-charcoal mb-2">
                Reset link sent
              </h2>
              <p className="text-[14px] text-muted leading-relaxed mb-6 max-w-[300px] mx-auto">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-medium text-charcoal">{email}</span>.
                Check your inbox and follow the instructions.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-brand hover:bg-brand-hover text-white text-[14px] font-semibold rounded-lg transition-colors"
              >
                Back to Sign In
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>
            </div>
          ) : (
            /* ── Reset form ────────────────────── */
            <>
              <div className="mb-6">
                <h2 className="text-[18px] font-semibold text-charcoal mb-1.5">
                  Forgot your password?
                </h2>
                <p className="text-[13px] text-muted leading-relaxed">
                  Enter your email address and we&apos;ll send you a link to reset
                  your password.
                </p>
              </div>

              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-3 bg-error/5 border border-error/15 text-error rounded-lg px-4 py-3 mb-6 text-[13px] leading-snug">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[13px] font-medium text-charcoal mb-1.5"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted pointer-events-none" strokeWidth={1.5} />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-12 pl-11 pr-4 text-[14px] text-charcoal placeholder:text-muted/60 bg-surface border border-border rounded-lg outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/10"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-brand hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-[14px] font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? (
                    <Loader2 className="w-[18px] h-[18px] animate-spin" strokeWidth={2} />
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-4 h-4" strokeWidth={2} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back to login */}
        <div className="text-center mt-6">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
