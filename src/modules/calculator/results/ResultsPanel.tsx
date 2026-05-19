import type { PvInputs, PvResult } from "../../../lib/calc";
import { fmt } from "../../../lib/calc";
import { CashflowChart } from "./CashflowChart";
import { KpiCards } from "./KpiCards";
import { ResultTable } from "./ResultTable";
import { SummaryStats } from "./SummaryStats";

interface Props {
  input: PvInputs;
  result: PvResult;
}

export function ResultsPanel({ input, result }: Props) {
  const annualProductionY1 = input.kwp * input.yieldPerKwp;
  return (
    <div className="flex flex-col gap-6">
      <KpiCards result={result} years={input.years} />

      <div className="rounded-2xl border border-heizma-border bg-heizma-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-heizma-ink">
              Kumulierter Cashflow
            </h2>
            <p className="mt-0.5 text-xs text-heizma-muted">
              Ersparnis abzüglich Investition ({fmt.eur(result.totalInvestment)}) –
              Break-Even, wenn die Linie 0 € erreicht.
            </p>
          </div>
        </div>
        <div className="mt-3">
          <CashflowChart rows={result.rows} investment={result.totalInvestment} />
        </div>
      </div>

      <SummaryStats result={result} years={input.years} />

      <section className="rounded-2xl border border-heizma-border bg-heizma-surface shadow-sm">
        <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-heizma-border px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-heizma-ink">
              Detailaufstellung
            </h2>
            <p className="mt-0.5 text-xs text-heizma-muted">
              Jahr für Jahr: PV-Produktion, Bezug, Einspeisung, Kosten und
              Ersparnis.
            </p>
          </div>
          <div className="text-xs text-heizma-muted">
            <span className="font-medium text-heizma-ink-soft">
              {fmt.int(annualProductionY1)} kWh
            </span>{" "}
            Jahresproduktion ·{" "}
            <span className="font-medium text-heizma-ink-soft">
              {fmt.pct(input.autarchyRate)}
            </span>{" "}
            Eigendeckung
          </div>
        </header>
        <ResultTable
          rows={result.rows}
          investment={result.totalInvestment}
          amortizationYear={result.amortizationYear}
        />
      </section>
    </div>
  );
}
