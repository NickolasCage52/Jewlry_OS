export default function AppSegmentLoading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="panel">
        <div className="flex flex-col gap-5">
          <div
            className="h-9 max-w-[14rem] rounded-md bg-[var(--border)] opacity-70 motion-safe:animate-pulse"
            aria-hidden
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-28 rounded-[var(--radius-lg,12px)] bg-[var(--border)] opacity-50 motion-safe:animate-pulse"
                aria-hidden
              />
            ))}
          </div>
          <div
            className="min-h-[200px] rounded-[var(--radius-lg,12px)] bg-[var(--border)] opacity-40 motion-safe:animate-pulse"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
