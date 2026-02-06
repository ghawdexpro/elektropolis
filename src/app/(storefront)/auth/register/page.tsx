"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validation
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
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
            Create your account
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
                Check your email
              </h2>
              <p className="text-[14px] text-muted leading-relaxed mb-6 max-w-[300px] mx-auto">
                We&apos;ve sent a confirmation link to{" "}
                <span className="font-medium text-charcoal">{email}</span>.
                Click the link to activate your account.
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
            /* ── Registration form ─────────────── */
            <>
              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-3 bg-error/5 border border-error/15 text-error rounded-lg px-4 py-3 mb-6 text-[13px] leading-snug">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-[13px] font-medium text-charcoal mb-1.5"
                  >
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted pointer-events-none" strokeWidth={1.5} />
                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full h-12 pl-11 pr-4 text-[14px] text-charcoal placeholder:text-muted/60 bg-surface border border-border rounded-lg outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/10"
                    />
                  </div>
                </div>

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

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-[13px] font-medium text-charcoal mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted pointer-events-none" strokeWidth={1.5} />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full h-12 pl-11 pr-11 text-[14px] text-charcoal placeholder:text-muted/60 bg-surface border border-border rounded-lg outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      ) : (
                        <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                  {/* Password strength hint */}
                  {password.length > 0 && password.length < 8 && (
                    <p className="text-[12px] text-muted mt-1.5">
                      {8 - password.length} more character{8 - password.length !== 1 ? "s" : ""} needed
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-[13px] font-medium text-charcoal mb-1.5"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted pointer-events-none" strokeWidth={1.5} />
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className={`w-full h-12 pl-11 pr-11 text-[14px] text-charcoal placeholder:text-muted/60 bg-surface border rounded-lg outline-none transition-all focus:ring-2 focus:ring-brand/10 ${
                        confirmPassword && confirmPassword !== password
                          ? "border-error focus:border-error"
                          : "border-border focus:border-brand"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal transition-colors"
                      tabIndex={-1}
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? (
                        <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      ) : (
                        <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-[12px] text-error mt-1.5">
                      Passwords do not match
                    </p>
                  )}
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
                      Create Account
                      <ArrowRight className="w-4 h-4" strokeWidth={2} />
                    </>
                  )}
                </button>
              </form>

              {/* Terms hint */}
              <p className="text-[11px] text-muted text-center mt-5 leading-relaxed">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-charcoal transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-charcoal transition-colors">
                  Privacy Policy
                </Link>
                .
              </p>
            </>
          )}
        </div>

        {/* Login link */}
        <p className="text-center text-[13px] text-muted mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-brand hover:text-brand-hover transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
