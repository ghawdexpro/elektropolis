export default function StorefrontLoading() {
  return (
    <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-16 md:py-20">
      <div className="animate-pulse space-y-8">
        {/* Title skeleton */}
        <div className="space-y-3">
          <div className="h-8 w-48 bg-surface rounded" />
          <div className="h-4 w-32 bg-surface rounded" />
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square bg-surface rounded-xl" />
              <div className="h-4 w-3/4 bg-surface rounded" />
              <div className="h-4 w-1/2 bg-surface rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
