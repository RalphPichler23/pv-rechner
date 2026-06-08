import type { PvResult } from "../../../lib/calc";
import { fmt } from "../../../lib/calc";

interface Props {
  result: PvResult;
  years: number;
}

type Tone = "red" | "green" | "ink" | "muted";

interface CardProps {
  label: string;
  value: string;
  hint?: string;
  tone: Tone;
}

const accents: Record<Tone, string> = {
  red:   "border-heizma-red/30 bg-gradient-to-br from-white to-heizma-red-soft/60",
  green: "border-heizma-green/30 bg-gradient-to-br from-white to-heizma-green-soft/60",
  ink:   "border-heizma-border bg-heizma-surface",
  muted: "border-heizma-border bg-heizma-surface",
};

const valueColors: Record<Tone, string> = {
  red:   "text-heizma-red",
  green: "text-heizma-green-dark",
  ink:   "text-heizma-ink",
  muted: "text-heizma-muted",
};

function KpiCard({ label, value, hint, tone }: CardProps) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${accents[tone]}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-heizma-muted">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-extrabold tabular-nums ${valueColors[tone]}`}>
        {value}
      </div>
      {hint ? <div className="mt-1 text-[11px] text-heizma-muted">{hint}</div> : null}
    </div>
  );
}

export function KpiCards({ result, years }: Props) {
  const yearOne = result.rows[0];
  const netto = result.totalSavings - result.totalInvestment;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <KpiCard
        label="Ersparnis Jahr 1"
        value={fmt.eur(yearOne.savings)}
        tone="green"
      />
      <KpiCard
        label={`Kumuliert (${years} J.)`}
        value={fmt.eur(result.totalSavings)}
        tone="ink"
      />
      <KpiCard
        label="Amortisation"
        value={
          result.amortizationFraction !== null
            ? fmt.years(result.amortizationFraction)
            : "—"
        }
        hint={
          result.amortizationYear !== null
            ? `Break-Even im Jahr ${result.amortizationYear}`
            : "im Zeitraum nicht erreicht"
        }
        tone={result.amortizationYear !== null ? "green" : "muted"}
      />
      <KpiCard
        label="Netto-Gewinn"
        value={fmt.eur(netto)}
        hint={
          result.totalInvestment > 0
            ? `ROI ${fmt.pct(result.roi - 1)} auf Investition`
            : undefined
        }
        tone={netto >= 0 ? "green" : "red"}
      />
    </div>
  );
}
