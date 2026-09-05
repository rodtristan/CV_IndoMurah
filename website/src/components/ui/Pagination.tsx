import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  );

  const items: (number | "ellipsis")[] = [];
  let last = 0;
  for (const p of pages) {
    if (p - last > 1) items.push("ellipsis");
    items.push(p);
    last = p;
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="flex size-8 items-center justify-center rounded-md text-toned hover:bg-elevated disabled:opacity-40"
      >
        <ChevronLeft className="size-4" />
      </button>
      {items.map((item, i) =>
        item === "ellipsis" ? (
          <span key={`e-${i}`} className="px-1.5 text-sm text-dimmed">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={cn(
              "flex size-8 items-center justify-center rounded-md text-sm font-medium",
              item === page ? "bg-inverted text-inverted-text" : "text-toned hover:bg-elevated",
            )}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
        className="flex size-8 items-center justify-center rounded-md text-toned hover:bg-elevated disabled:opacity-40"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
