import Link from "next/link";
import { getIndicator } from "@/data/dictionary";
import { getLatest } from "@/lib/data";
import { getSource } from "@/data/sources";
import Delta from "@/components/charts/Delta";
import StateView from "@/components/ui/StateView";
import MetricValue from "@/components/charts/MetricValue";
import { TextureCard, TextureCardContent } from "@/components/cult/TextureCard";

export default function MetricCard({
  indicatorId,
  territoryId = "UY",
  href,
}: {
  indicatorId: string;
  territoryId?: string;
  href?: string;
}) {
  const indicator = getIndicator(indicatorId);
  if (!indicator) return null;
  const latest = getLatest(indicatorId, territoryId);
  const source = getSource(indicator.sourceId);
  const target = href ?? `/indicadores/${indicator.slug}`;

  const latestValue = latest?.obs.value;
  if (!latest || latestValue === null || latestValue === undefined) {
    return (
      <TextureCard>
        <TextureCardContent className="p-4">
          <p className="text-sm font-bold text-ink-soft">{indicator.name}</p>
          <div className="mt-2">
            <StateView kind="pending" compact />
          </div>
        </TextureCardContent>
      </TextureCard>
    );
  }

  const { obs, delta, prev } = latest;
  return (
    <Link href={target} className="group block rounded-2xl focus-visible:outline-focus">
      <TextureCard className="h-full transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:border-celeste group-active:translate-y-0">
        <TextureCardContent className="flex h-full flex-col p-4">
          <p className="text-sm font-bold text-ink-soft">{indicator.name}</p>
          <p className="tnum mt-1 font-display text-3xl font-bold text-ink md:text-4xl">
            <MetricValue value={latestValue} unit={indicator.unit} decimals={indicator.decimals} />
          </p>
          <div className="mt-1 min-h-5">
            {delta !== undefined ? (
              <Delta delta={delta} indicator={indicator} prevLabel={prev?.periodLabel} />
            ) : null}
          </div>
          <p className="mt-2 text-xs text-ink-faint">
            {obs.periodLabel} · {source?.shortName ?? indicator.sourceId}
          </p>
        </TextureCardContent>
      </TextureCard>
    </Link>
  );
}
