import type { PvResult } from "../../../lib/calc";
import { fmt } from "../../../lib/calc";

interface Props {
  result: PvResult;
  years: number;
}

export function SummaryStats({ result, years }: Props) {
  const lastRow = result.rows[result.rows.length - 1];
  const items = [
    { label: "Gesamtproduktion", value: `${fmt.int(result.totalProduction)} kWh` },
    { label: "Eigenverbrauch gesamt", value: `${fmt.int(result.totalSelfConsumption)} kWh` },
    { label: "Einspeisung gesamt", value: `${fmt.int(result.totalFeedIn)} kWh` },
    { label: "Ø Eigendeckung", value: fmt.pct(result.averageAutarchy) },
    {
      label: `Strompreis Jahr ${years}`,
      value: `${fmt.cents(lastRow.electricityPrice)} ct/kWh`,
    },
  ];
  return (
    <div className="rounded-2xl border border-heizma-border bg-heizma-surface p-5 shadow-sm">
      <h2 className="text-base font-bold text-heizma-ink">
        Energiebilanz über {years} Jahre
      </h2>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5">
        {items.map((it) => (
          <div key={it.label}>
            <dt className="text-[11px] font-medium uppercase tracking-wider text-heizma-muted">
              {it.label}
            </dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-heizma-ink">
              {it.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
