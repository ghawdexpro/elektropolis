"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
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
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/account"), 2000);
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
          <p className="text-[14px] text-muted mt-2">Set your new password</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2
                  className="w-7 h-7 text-success"
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="text-[18px] font-semibold text-charcoal mb-2">
                Password updated
              </h2>
              <p className="text-[14px] text-muted leading-relaxed mb-6 max-w-[300px] mx-auto">
                Your password has been changed successfully. Redirecting to your
                account...
              </p>
              <Link
                href="/account"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-brand hover:bg-brand-hover text-white text-[14px] font-semibold rounded-lg transition-colors"
              >
                Go to Account
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-[18px] font-semibold text-charcoal mb-1.5">
                  Create a new password
                </h2>
                <p className="text-[13px] text-muted leading-relaxed">
                  Enter your new password below. Make sure it&apos;s at least 8
                  characters long.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 bg-error/5 border border-error/15 text-error rounded-lg px-4 py-3 mb-6 text-[13px] leading-snug">
                  <AlertCircle
                    className="w-4 h-4 shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-[13px] font-medium text-charcoal mb-1.5"
                  >
                    New password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted pointer-events-none"
                      strokeWidth={1.5}
                    />
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
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff
                          className="w-[18px] h-[18px]"
                          strokeWidth={1.5}
                        />
                      ) : (
                        <Eye
                          className="w-[18px] h-[18px]"
                          strokeWidth={1.5}
                        />
                      )}
                    </button>
                  </div>
                  {password.length > 0 && password.length < 8 && (
                    <p className="text-[12px] text-muted mt-1.5">
                      {8 - password.length} more character
                      {8 - password.length !== 1 ? "s" : ""} needed
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-[13px] font-medium text-charcoal mb-1.5"
                  >
                    Confirm new password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted pointer-events-none"
                      strokeWidth={1.5}
                    />
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
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
                      aria-label={
                        showConfirm ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirm ? (
                        <EyeOff
                          className="w-[18px] h-[18px]"
                          strokeWidth={1.5}
                        />
                      ) : (
                        <Eye
                          className="w-[18px] h-[18px]"
                          strokeWidth={1.5}
                        />
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
                    <Loader2
                      className="w-[18px] h-[18px] animate-spin"
                      strokeWidth={2}
                    />
                  ) : (
                    <>
                      Update Password
                      <ArrowRight className="w-4 h-4" strokeWidth={2} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
