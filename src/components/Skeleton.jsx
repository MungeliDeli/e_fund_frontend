// Skeleton.jsx
// Reusable skeleton loading component for consistent loading states

function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse bg-[color:var(--color-muted)] rounded ${className}`}
      {...props}
    />
  );
}

// Predefined skeleton components for common patterns
export function SkeletonCard({ className = "" }) {
  return (
    <div
      className={`bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-xl p-6 ${className}`}
    >
      <Skeleton className="h-6 w-1/2 mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, className = "" }) {
  return (
    <div
      className={`bg-[color:var(--color-surface)] border border-[color:var(--color-muted)] rounded-lg p-4 ${className}`}
    >
      {/* Table header */}
      <div className="flex gap-4 mb-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {/* Table rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 mb-3">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard({ className = "" }) {
  return (
    <div className={`p-4 md:p-6 lg:p-8 ${className}`}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Meta cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Charts section skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <SkeletonCard />
        </div>
        <div>
          <SkeletonCard />
        </div>
      </div>

      {/* Content section skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export default Skeleton;
