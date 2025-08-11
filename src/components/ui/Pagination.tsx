"use client";

import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  hrefBuilder?: (p: number) => string;
  prevHref?: string;
  nextHref?: string;
  className?: string;
};

export default function Pagination({
  page,
  totalPages,
  hrefBuilder,
  prevHref,
  nextHref,
  className,
}: Props) {
  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const buildPrev = prevHref ?? (hrefBuilder ? hrefBuilder(prev) : "#");
  const buildNext = nextHref ?? (hrefBuilder ? hrefBuilder(next) : "#");

  return (
    <div
      className={`mt-6 flex items-center justify-between ${className ?? ""}`}
    >
      {canPrev ? (
        <Link
          className="text-sm text-gray-700 hover:text-black"
          href={buildPrev}
        >
          ← Anterior
        </Link>
      ) : (
        <span className="text-sm text-gray-400">← Anterior</span>
      )}
      <span className="text-sm text-gray-600">
        Página {page} de {totalPages}
      </span>
      {canNext ? (
        <Link
          className="text-sm text-gray-700 hover:text-black"
          href={buildNext}
        >
          Siguiente →
        </Link>
      ) : (
        <span className="text-sm text-gray-400">Siguiente →</span>
      )}
    </div>
  );
}
