import Link from "next/link";

export interface RankingEntryView {
  label: string;
  href?: string;
  value: number;
  display: string;
}

/** Ranking como barras horizontales accesibles (HTML, no canvas). */
export default function RankingList({ entries }: { entries: RankingEntryView[] }) {
  const max = Math.max(...entries.map((e) => e.value), 1);
  return (
    <ol className="space-y-1.5">
      {entries.map((e, i) => {
        const inner = (
          <div className="grid grid-cols-[1.5rem_9rem_1fr_auto] items-center gap-2 rounded-lg px-2 py-1 text-sm transition-colors hover:bg-primary-soft/50 sm:grid-cols-[1.75rem_11rem_1fr_auto]">
            <span className="tnum text-ink-faint">{i + 1}</span>
            <span className="truncate font-semibold text-ink">{e.label}</span>
            <span aria-hidden className="h-4 overflow-hidden rounded-r-sm bg-primary-soft">
              <span
                className="block h-full rounded-r-sm bg-primary"
                style={{ width: `${Math.max((e.value / max) * 100, 1.5)}%` }}
              />
            </span>
            <span className="tnum font-semibold text-ink">{e.display}</span>
          </div>
        );
        return (
          <li key={e.label}>{e.href ? <Link href={e.href}>{inner}</Link> : inner}</li>
        );
      })}
    </ol>
  );
}
