import type { PvInputs, PvResult, TabMode } from "../../../lib/calc";
import { ConsumptionSection } from "./ConsumptionSection";
import { EmsSection } from "./EmsSection";
import { EnergyCommunitySection } from "./EnergyCommunitySection";
import { HeatPumpSection } from "./HeatPumpSection";
import { PricingSection } from "./PricingSection";
import { PvInputSection } from "./PvInputSection";
import type { Setter } from "./types";

interface Props {
  tab: TabMode;
  input: PvInputs;
  result: PvResult;
  set: Setter;
  setMany: (patch: Partial<PvInputs>) => void;
  onReset: () => void;
}

export function InputsPanel({ tab, input, result, set, setMany, onReset }: Props) {
  const showPv = tab !== "wp";
  const showWp = tab !== "pv";

  return (
    <div className="rounded-2xl border border-heizma-border bg-heizma-surface p-5 shadow-sm print:hidden">
      <h2 className="text-base font-bold text-heizma-ink">Eingaben</h2>
      <p className="mt-0.5 text-xs text-heizma-muted">
        Werte können jederzeit angepasst werden – alles rechnet sich live neu.
      </p>

      {showPv ? (
        <PvInputSection
          input={input}
          set={set}
          totalInvestment={result.totalInvestment}
        />
      ) : null}

      <ConsumptionSection
        input={input}
        set={set}
        wpElectricity={result.wpElectricity}
      />

      {showPv ? <EmsSection input={input} set={set} /> : null}
      {showPv ? <EnergyCommunitySection input={input} set={set} /> : null}

      {showWp ? (
        <HeatPumpSection
          input={input}
          set={set}
          setMany={setMany}
          wpHeatDemand={result.wpHeatDemand}
          wpElectricity={result.wpElectricity}
          showToggle={tab === "combined"}
        />
      ) : null}

      <PricingSection input={input} set={set} showPv={showPv} />

      <button
        type="button"
        onClick={onReset}
        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-heizma-border bg-heizma-bg px-3 py-1.5 text-sm font-medium text-heizma-ink-soft transition hover:border-heizma-green/40 hover:text-heizma-green-dark"
      >
        <span aria-hidden>↻</span> Auf Standardwerte zurücksetzen
      </button>
    </div>
  );
}
