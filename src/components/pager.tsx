import Link from "next/link";

export function pageWindow(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const keep = new Set(
    [1, 2, page - 1, page, page + 1, totalPages - 1, totalPages].filter((n) => n >= 1 && n <= totalPages),
  );
  const sorted = [...keep].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((n, index) => {
    if (index > 0 && n - sorted[index - 1]! > 1) out.push("…");
    out.push(n);
  });
  return out;
}

export function Pager({
  page,
  totalPages,
  hrefFor,
  label,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  label: string;
}) {
  if (totalPages <= 1) return null;
  const clamped = Math.min(Math.max(page, 1), totalPages);
  return (
    <nav className="browse-pager" aria-label={label}>
      {clamped > 1 ? (
        <Link className="erp-btn erp-btn-ghost" href={hrefFor(clamped - 1)}>
          ← Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="pager-numbers" role="list">
        {pageWindow(clamped, totalPages).map((item, index) =>
          item === "…" ? (
            <span className="pager-dots" key={`dots-${index}`} aria-hidden="true">
              …
            </span>
          ) : item === clamped ? (
            <span className="pager-num pager-current" key={item} aria-current="page">
              {item}
            </span>
          ) : (
            <Link className="pager-num" key={item} href={hrefFor(item)}>
              {item}
            </Link>
          ),
        )}
      </span>
      {clamped < totalPages ? (
        <Link className="erp-btn erp-btn-ghost" href={hrefFor(clamped + 1)}>
          Next →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
