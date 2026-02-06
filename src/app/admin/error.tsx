"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
        <AlertTriangle className="w-7 h-7 text-red-500" strokeWidth={1.5} />
      </div>
      <h1 className="text-xl font-bold text-charcoal mb-2">
        Something went wrong
      </h1>
      <p className="text-sm text-muted mb-6">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-lg transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}
