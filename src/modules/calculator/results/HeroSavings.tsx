import type { PvResult } from "../../../lib/calc";
import { fmt } from "../../../lib/calc";

interface Props {
  result: PvResult;
  years: number;
}

/**
 * Prominenter Hero-Block ganz oben in der Ergebnis-Spalte.
 * Zeigt die Gesamtersparnis als XL-Zahl, plus Netto-Gewinn und Amortisation als Sub-Werte.
 */
export function HeroSavings({ result, years }: Props) {
  const netto = result.totalSavings - result.totalInvestment;
  const isPositive = netto >= 0;
  const amort =
    result.amortizationFraction !== null
      ? fmt.years(result.amortizationFraction)
      : "—";

  return (
    <div className="overflow-hidden rounded-2xl border border-heizma-green/30 bg-gradient-to-br from-heizma-green-soft via-white to-heizma-green-soft/40 p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-heizma-green-dark">
            Ihre Gesamtersparnis über {years} Jahre
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span
              className="text-5xl font-extrabold leading-none tabular-nums text-heizma-green-dark sm:text-6xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              {fmt.eur(result.totalSavings)}
            </span>
            <span className="text-sm font-medium text-heizma-muted">
              kumuliert
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[12px]">
            <Stat
              label="Netto-Gewinn nach Investition"
              value={fmt.eur(netto)}
              valueClass={isPositive ? "text-heizma-green-dark" : "text-heizma-red"}
            />
            <Stat
              label="Amortisation"
              value={amort}
              valueClass="text-heizma-ink"
            />
            <Stat
              label="Investition gesamt"
              value={fmt.eur(result.totalInvestment)}
              valueClass="text-heizma-ink"
            />
          </div>
        </div>
        <div className="hidden text-right sm:block">
          <div
            className="text-7xl leading-none"
            aria-hidden
            style={{ filter: "saturate(0.8)" }}
          >
            🌱
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-heizma-muted">
        {label}
      </div>
      <div className={`mt-0.5 text-base font-bold tabular-nums ${valueClass}`}>
        {value}
      </div>
    </div>
  );
}
