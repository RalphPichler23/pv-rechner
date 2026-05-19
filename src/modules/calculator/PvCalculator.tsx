import { useCallback, useMemo, useState } from "react";
import {
  calculate,
  DEFAULT_INPUTS,
  presetForTab,
  type PvInputs,
  type TabMode,
} from "../../lib/calc";
import { Toolbar } from "./components/Toolbar";
import { InputsPanel } from "./inputs/InputsPanel";
import { PrintHeader } from "./print/PrintHeader";
import { PrintParameterStrip } from "./print/PrintParameterStrip";
import { ResultsPanel } from "./results/ResultsPanel";

/**
 * Hauptkomponente. Hält den Input-State und den Tab-Modus.
 * Reine Orchestrierung – die echte Arbeit passiert in den Sub-Komponenten.
 */
export function PvCalculator() {
  const [tab, setTab] = useState<TabMode>("pv");
  const [input, setInput] = useState<PvInputs>(DEFAULT_INPUTS);
  const result = useMemo(() => calculate(input), [input]);

  const set = useCallback(
    <K extends keyof PvInputs>(key: K, value: PvInputs[K]) =>
      setInput((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const setMany = useCallback(
    (patch: Partial<PvInputs>) => setInput((prev) => ({ ...prev, ...patch })),
    [],
  );

  const onTabChange = useCallback(
    (mode: TabMode) => {
      setTab(mode);
      setInput((prev) => presetForTab(prev, mode));
    },
    [],
  );

  const onReset = useCallback(
    () => setInput(presetForTab(DEFAULT_INPUTS, tab)),
    [tab],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Toolbar tab={tab} onTabChange={onTabChange} years={input.years} />

      {/* Druck-Header (nur beim Drucken sichtbar) */}
      <div className="hidden print:mb-4 print:block">
        <PrintHeader tab={tab} />
        <PrintParameterStrip input={input} tab={tab} />
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] print:block">
        <InputsPanel
          tab={tab}
          input={input}
          result={result}
          set={set}
          setMany={setMany}
          onReset={onReset}
        />
        <ResultsPanel input={input} result={result} />
      </section>

      <footer className="mt-8 text-center text-xs text-heizma-muted">
        Vereinfachte Modellrechnung – ohne Berücksichtigung von Wartung der PV,
        Zinsen oder Steuern. Werte sind Richtwerte zur Orientierung.
      </footer>
    </div>
  );
}
