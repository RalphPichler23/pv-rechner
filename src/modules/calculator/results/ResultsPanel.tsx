import type { PvInputs, PvResult } from "../../../lib/calc";
import { fmt } from "../../../lib/calc";
import { CalculationBreakdown } from "./CalculationBreakdown";
import { CashflowChart } from "./CashflowChart";
import { CostComparisonChart } from "./CostComparisonChart";
import { HeroSavings } from "./HeroSavings";
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
      <HeroSavings result={result} years={input.years} />
      <KpiCards result={result} years={input.years} />

      <div className="rounded-2xl border border-heizma-border bg-heizma-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-heizma-ink">
              Kostenvergleich über die Zeit
            </h2>
            <p className="mt-0.5 text-xs text-heizma-muted">
              Was würde man insgesamt zahlen – mit vs. ohne Investition?
              Schnittpunkt = Amortisation.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-heizma-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-3.5 rounded-sm bg-heizma-red" />
              Ohne Investition (Status quo)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-3.5 rounded-sm bg-heizma-green-dark" />
              Mit Investition
            </span>
          </div>
        </div>
        <div className="mt-3">
          <CostComparisonChart
            rows={result.rows}
            investment={result.totalInvestment}
          />
        </div>
      </div>

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

      <CalculationBreakdown input={input} result={result} />

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
