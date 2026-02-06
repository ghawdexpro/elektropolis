import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <p className="text-[80px] font-bold text-brand leading-none mb-4">404</p>
        <h1 className="text-[24px] font-bold text-charcoal tracking-tight mb-3">
          Page Not Found
        </h1>
        <p className="text-[14px] text-muted mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 px-7 bg-brand hover:bg-brand-hover text-white text-[14px] font-semibold rounded-lg transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/collections"
            className="inline-flex items-center justify-center h-11 px-7 border border-border text-charcoal text-[14px] font-medium rounded-lg hover:bg-surface transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
