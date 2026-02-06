"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function StorefrontError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-20 md:py-28">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-[24px] font-bold text-charcoal mb-3">
          Something went wrong
        </h1>
        <p className="text-[15px] text-muted mb-8">
          We encountered an unexpected error. Please try again or contact us if
          the problem persists.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-brand hover:bg-brand-hover text-white text-[14px] font-semibold rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 px-6 border border-border text-charcoal text-[14px] font-medium rounded-lg hover:bg-surface transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
