"use client";

import { useEffect } from "react";

export default function AppSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="panel text-center">
        <h1 className="m-0 font-display text-xl font-semibold text-[var(--ink2)]">
          Не удалось загрузить раздел
        </h1>
        <p className="mt-3 text-[0.95rem] text-[var(--muted)]">
          Проверьте соединение и попробуйте снова. Если проблема повторяется,
          обратитесь к администратору.
        </p>
        <button
          type="button"
          className="btn btn--primary mt-6"
          onClick={() => reset()}
        >
          Повторить
        </button>
      </div>
    </div>
  );
}
