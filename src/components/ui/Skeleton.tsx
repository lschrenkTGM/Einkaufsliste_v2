interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800 ${className}`}
      aria-hidden="true"
    />
  );
}
