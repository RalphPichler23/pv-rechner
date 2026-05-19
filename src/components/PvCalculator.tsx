import { useMemo, useState } from "react";
import { calculate, fmt, type PvInputs } from "../lib/pv";
import { NumberInput } from "./NumberInput";
import { SavingsChart } from "./SavingsChart";

const DEFAULT_INPUTS: PvInputs = {
  kwp: 14,
  yieldPerKwp: 1075,
  consumption: 11000,
  autarchyRate: 0.8,
  electricityPrice: 0.21,
  feedInTariff: 0.084,
  priceIncrease: 0.05,
  degradation: 0.005,
  years: 20,
  investment: 22000,
};

export function PvCalculator() {
  const [input, setInput] = useState<PvInputs>(DEFAULT_INPUTS);
  const result = useMemo(() => calculate(input), [input]);

  const set = <K extends keyof PvInputs>(key: K, value: PvInputs[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const yearOneRow = result.rows[0];
  const lastRow = result.rows[result.rows.length - 1];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      {/* Eingabebereich */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-heizma-border bg-heizma-surface p-5 shadow-sm">
          <h2 className="text-base font-bold text-heizma-ink">Eingaben</h2>
          <p className="mt-0.5 text-xs text-heizma-muted">
            Werte können jederzeit angepasst werden – alles rechnet sich live
            neu.
          </p>

          <Fieldset legend="Anlage">
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Anlagengröße"
                unit="kWp"
                value={input.kwp}
                onChange={(v) => set("kwp", v)}
                min={0}
                step={0.5}
                decimals={1}
              />
              <NumberInput
                label="Spez. Ertrag"
                unit="kWh/kWp"
                value={input.yieldPerKwp}
                onChange={(v) => set("yieldPerKwp", v)}
                min={0}
                step={25}
                hint="AT typisch 950 – 1.150"
              />
            </div>
            <div className="mt-3">
              <NumberInput
                label="Investitionssumme (netto, nach Förderung)"
                unit="€"
                value={input.investment}
                onChange={(v) => set("investment", v)}
                min={0}
                step={500}
              />
            </div>
          </Fieldset>

          <Fieldset legend="Verbrauch & Eigennutzung">
            <NumberInput
              label="Jahresstromverbrauch"
              unit="kWh"
              value={input.consumption}
              onChange={(v) => set("consumption", v)}
              min={0}
              step={500}
            />
            <div className="mt-3">
              <NumberInput
                label="Eigenverbrauchsquote (Anteil des Verbrauchs)"
                unit="%"
                value={input.autarchyRate * 100}
                onChange={(v) => set("autarchyRate", v / 100)}
                min={0}
                max={100}
                step={1}
                decimals={0}
                hint="Wie viel % des Verbrauchs deckt die PV (mit Speicher meist 70-85 %)"
              />
            </div>
          </Fieldset>

          <Fieldset legend="Preise">
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Strompreis"
                unit="ct/kWh"
                value={input.electricityPrice * 100}
                onChange={(v) => set("electricityPrice", v / 100)}
                min={0}
                step={0.5}
                decimals={2}
              />
              <NumberInput
                label="Einspeisetarif"
                unit="ct/kWh"
                value={input.feedInTariff * 100}
                onChange={(v) => set("feedInTariff", v / 100)}
                min={0}
                step={0.1}
                decimals={2}
              />
            </div>
          </Fieldset>

          <Fieldset legend="Steigerung & Degradation">
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Strompreis-Steigerung p. a."
                unit="%"
                value={input.priceIncrease * 100}
                onChange={(v) => set("priceIncrease", v / 100)}
                min={0}
                step={0.1}
                decimals={1}
              />
              <NumberInput
                label="PV-Degradation p. a."
                unit="%"
                value={input.degradation * 100}
                onChange={(v) => set("degradation", v / 100)}
                min={0}
                step={0.1}
                decimals={1}
              />
            </div>
            <div className="mt-3">
              <NumberInput
                label="Betrachtungszeitraum"
                unit="Jahre"
                value={input.years}
                onChange={(v) => set("years", Math.max(1, Math.round(v)))}
                min={1}
                max={40}
                step={1}
                decimals={0}
              />
            </div>
          </Fieldset>

          <button
            type="button"
            onClick={() => setInput(DEFAULT_INPUTS)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-heizma-border bg-heizma-bg px-3 py-1.5 text-sm font-medium text-heizma-ink-soft transition hover:border-heizma-green/40 hover:text-heizma-green-dark"
          >
            <span aria-hidden>↻</span> Auf Vorlage zurücksetzen
          </button>
        </div>

        {/* KPI + Chart */}
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard
              label="Ersparnis Jahr 1"
              value={fmt.eur(yearOneRow.savings)}
              tone="green"
            />
            <KpiCard
              label={`Kumuliert (${input.years} J.)`}
              value={fmt.eur(result.totalSavings)}
              tone="ink"
            />
            <KpiCard
              label="Amortisation"
              value={
                result.amortizationYear !== null
                  ? `Jahr ${result.amortizationYear}`
                  : "—"
              }
              hint={
                result.amortizationFraction !== null
                  ? `nach ${result.amortizationFraction.toFixed(1)} Jahren`
                  : "im Zeitraum nicht erreicht"
              }
              tone={result.amortizationYear !== null ? "green" : "muted"}
            />
            <KpiCard
              label="Netto-Gewinn"
              value={fmt.eur(result.totalSavings - input.investment)}
              hint={
                input.investment > 0
                  ? `ROI ${fmt.pct(result.roi - 1)} auf Investition`
                  : undefined
              }
              tone={
                result.totalSavings - input.investment >= 0 ? "green" : "red"
              }
            />
          </div>

          <div className="rounded-2xl border border-heizma-border bg-heizma-surface p-5 shadow-sm">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-heizma-ink">
                  Kumulierter Cashflow
                </h2>
                <p className="mt-0.5 text-xs text-heizma-muted">
                  Ersparnis abzüglich Investition ({fmt.eur(input.investment)}) –
                  Break-Even, wenn die Linie 0 € erreicht.
                </p>
              </div>
              <div className="text-right text-xs text-heizma-muted">
                <Legend
                  items={[
                    { color: "bg-heizma-green-dark", label: "Cashflow" },
                    { color: "bg-heizma-green/30", label: "Gewinnzone" },
                  ]}
                />
              </div>
            </div>
            <div className="mt-3">
              <SavingsChart rows={result.rows} investment={input.investment} />
            </div>
          </div>

          <SummaryStats
            production={result.totalProduction}
            selfConsumption={result.totalSelfConsumption}
            feedIn={result.totalFeedIn}
            averageAutarchy={result.averageAutarchy}
            years={input.years}
            finalPrice={lastRow.electricityPrice}
          />
        </div>
      </section>

      {/* Tabelle */}
      <section className="mt-8 rounded-2xl border border-heizma-border bg-heizma-surface shadow-sm">
        <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-heizma-border px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-heizma-ink">
              Detailaufstellung
            </h2>
            <p className="mt-0.5 text-xs text-heizma-muted">
              Jahr für Jahr: Stromproduktion, Bezug & Einspeisung, Kosten und
              Ersparnis.
            </p>
          </div>
          <div className="text-xs text-heizma-muted">
            <span className="font-medium text-heizma-ink-soft">
              {fmt.int(input.kwp * input.yieldPerKwp)} kWh
            </span>{" "}
            Jahresproduktion ·{" "}
            <span className="font-medium text-heizma-ink-soft">
              {fmt.pct(input.autarchyRate)}
            </span>{" "}
            Eigenverbrauchsquote
          </div>
        </header>
        <ResultTable
          rows={result.rows}
          investment={input.investment}
          amortizationYear={result.amortizationYear}
        />
      </section>

      <footer className="mt-8 text-center text-xs text-heizma-muted">
        Vereinfachte Modellrechnung – ohne Berücksichtigung von Wartung, Inflation
        des Einspeisetarifs, Zinsen oder Steuern. Werte sind Richtwerte zur
        Orientierung.
      </footer>
    </div>
  );
}

// ---------- Hilfs-Komponenten ----------

function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="mt-5 border-t border-heizma-border pt-4 first:mt-4 first:border-t-0 first:pt-0">
      <legend className="-mb-1 text-[11px] font-semibold uppercase tracking-wider text-heizma-muted">
        {legend}
      </legend>
      <div className="mt-3">{children}</div>
    </fieldset>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  tone: "red" | "green" | "ink" | "muted";
}

function KpiCard({ label, value, hint, tone }: KpiCardProps) {
  const accent = {
    red:
      "border-heizma-red/30 bg-gradient-to-br from-white to-heizma-red-soft/60",
    green:
      "border-heizma-green/30 bg-gradient-to-br from-white to-heizma-green-soft/60",
    ink: "border-heizma-border bg-heizma-surface",
    muted: "border-heizma-border bg-heizma-surface",
  }[tone];
  const valueColor = {
    red: "text-heizma-red",
    green: "text-heizma-green-dark",
    ink: "text-heizma-ink",
    muted: "text-heizma-muted",
  }[tone];
  return (
    <div className={`rounded-2xl border ${accent} p-4 shadow-sm`}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-heizma-muted">
        {label}
      </div>
      <div
        className={`mt-1 text-2xl font-extrabold tabular-nums ${valueColor}`}
      >
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-[11px] text-heizma-muted">{hint}</div>
      ) : null}
    </div>
  );
}

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex items-center justify-end gap-3">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <span className={`inline-block h-2.5 w-2.5 rounded-sm ${it.color}`} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

function SummaryStats({
  production,
  selfConsumption,
  feedIn,
  averageAutarchy,
  years,
  finalPrice,
}: {
  production: number;
  selfConsumption: number;
  feedIn: number;
  averageAutarchy: number;
  years: number;
  finalPrice: number;
}) {
  const items = [
    { label: "Gesamtproduktion", value: `${fmt.int(production)} kWh` },
    { label: "Eigenverbrauch gesamt", value: `${fmt.int(selfConsumption)} kWh` },
    { label: "Einspeisung gesamt", value: `${fmt.int(feedIn)} kWh` },
    { label: "Ø Eigendeckung", value: fmt.pct(averageAutarchy) },
    {
      label: `Strompreis in Jahr ${years}`,
      value: `${fmt.cents(finalPrice)} ct/kWh`,
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

function ResultTable({
  rows,
  investment,
  amortizationYear,
}: {
  rows: { year: number; electricityPrice: number; pvProduction: number;
    gridConsumption: number; feedIn: number; costWithoutPv: number;
    costWithPv: number; savings: number; cumulativeSavings: number;
    netCashflow: number; }[];
  investment: number;
  amortizationYear: number | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-heizma-bg text-left text-[11px] font-semibold uppercase tracking-wider text-heizma-muted">
            <Th>Jahr</Th>
            <Th align="right">Strompreis (ct/kWh)</Th>
            <Th align="right">PV-Prod. (kWh)</Th>
            <Th align="right">Netzbezug (kWh)</Th>
            <Th align="right">Einspeisung (kWh)</Th>
            <Th align="right">Ohne PV (€)</Th>
            <Th align="right">Mit PV (€)</Th>
            <Th align="right">Ersparnis (€)</Th>
            <Th align="right">Kumuliert (€)</Th>
            {investment > 0 ? <Th align="right">vs. Investition</Th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isAmortYear = r.year === amortizationYear;
            return (
              <tr
                key={r.year}
                className={`border-t border-heizma-border/70 ${
                  isAmortYear
                    ? "bg-heizma-green-soft/60 font-semibold text-heizma-ink"
                    : "hover:bg-heizma-bg/60"
                }`}
              >
                <Td>
                  <div className="flex items-center gap-2">
                    <span>Jahr {r.year}</span>
                    {isAmortYear ? (
                      <span className="rounded-full bg-heizma-green px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Break-Even
                      </span>
                    ) : null}
                  </div>
                </Td>
                <Td align="right">{fmt.cents(r.electricityPrice)}</Td>
                <Td align="right">{fmt.int(r.pvProduction)}</Td>
                <Td align="right">{fmt.int(r.gridConsumption)}</Td>
                <Td align="right">{fmt.int(r.feedIn)}</Td>
                <Td align="right">{fmt.eur(r.costWithoutPv)}</Td>
                <Td align="right">
                  <span
                    className={
                      r.costWithPv < 0
                        ? "text-heizma-green"
                        : "text-heizma-ink"
                    }
                  >
                    {fmt.eur(r.costWithPv)}
                  </span>
                </Td>
                <Td align="right">
                  <span className="font-semibold text-heizma-green-dark">
                    {fmt.eur(r.savings)}
                  </span>
                </Td>
                <Td align="right">{fmt.eur(r.cumulativeSavings)}</Td>
                {investment > 0 ? (
                  <Td align="right">
                    <span
                      className={
                        r.netCashflow >= 0
                          ? "text-heizma-green"
                          : "text-heizma-muted"
                      }
                    >
                      {fmt.eur(r.netCashflow)}
                    </span>
                  </Td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap px-4 py-2.5 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`whitespace-nowrap px-4 py-2.5 tabular-nums ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}
