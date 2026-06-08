import { useCallback, useMemo, useState } from "react";
import {
  calculate,
  DEFAULT_INPUTS,
  presetForTab,
  recommendedAutarchy,
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
  const [rawInput, setInput] = useState<PvInputs>(DEFAULT_INPUTS);

  // Autarkie wird automatisch aus den anderen Inputs abgeleitet.
  // HTW-Berlin-Approximation: bei kleinem Verbrauch sättigt der Speicher
  // schneller (e^(-1,5·ratio)).
  const input = useMemo<PvInputs>(() => {
    const wpEl =
      rawInput.wpEnabled && rawInput.wpScop > 0
        ? (rawInput.oldFuelDemand * rawInput.oldHeatingEfficiency) / rawInput.wpScop
        : 0;
    const ev = rawInput.evEnabled ? rawInput.evKwhPerYear : 0;
    const existingWp =
      rawInput.existingWpEnabled && !rawInput.wpEnabled
        ? rawInput.existingWpKwhPerYear
        : 0;
    const pool = rawInput.poolEnabled ? rawInput.poolKwhPerYear : 0;
    const sauna = rawInput.saunaEnabled ? rawInput.saunaKwhPerYear : 0;
    const whirlpool = rawInput.whirlpoolEnabled ? rawInput.whirlpoolKwhPerYear : 0;
    const ac = rawInput.acEnabled ? rawInput.acKwhPerYear : 0;
    const pvProduction = rawInput.kwp * rawInput.yieldPerKwp;
    // WP-EMS-Integration nur wirksam, wenn EMS aktiv
    const wpInt = rawInput.emsEnabled && rawInput.wpEmsIntegrated;
    const autarchy = recommendedAutarchy(
      rawInput.consumption,
      rawInput.storageKwh,
      wpEl,
      pvProduction,
      ev,
      existingWp,
      pool,
      sauna,
      whirlpool,
      ac,
      wpInt,
    );
    return { ...rawInput, autarchyRate: autarchy };
  }, [rawInput]);

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

      <footer className="mt-8 rounded-2xl border border-heizma-border bg-heizma-bg/40 p-5 text-xs text-heizma-muted print:bg-transparent">
        <div className="font-semibold text-heizma-ink-soft">
          Modell-Transparenz · was rechnet der Rechner ein und was nicht?
        </div>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <div>
            <div className="font-medium text-heizma-green-dark">✓ Berücksichtigt</div>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              <li>WP-Wartung (falls Heizungstausch aktiv)</li>
              <li>Modul-Degradation 0,5 %/J (Hersteller-Annahme)</li>
              <li>Strompreis-Steigerung kompoundiert jedes Jahr</li>
              <li>Brennstoffpreis-Steigerung kompoundiert</li>
              <li>Speicher-Sättigung mit zunehmender Größe (HTW-Approximation)</li>
              <li>Saisonale Synergie-Faktoren (WP-Winter vs. Pool-Sommer)</li>
              <li>EG-Tarife mit eigener Preissteigerung</li>
              <li>Dyn. Strom-Tarif (nur auf Netzbezug nach EMS-Steuerung)</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-heizma-red">✗ Nicht modelliert</div>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              <li>PV-Wartung &amp; Versicherung (moderne Anlagen wartungsarm,
                  Versicherung meist in Gebäudeversicherung enthalten)</li>
              <li>Wechselrichter-Tausch (moderne Geräte halten oft 25 J)</li>
              <li>Speicher-Kapazitätsverlust (LFP-Speicher halten 20–25 J,
                  Restkapazität nach 15 J meist noch 70–80 %)</li>
              <li>Schwankender Spot-Markt-Einspeisetarif (modelliert konstant)</li>
              <li>Kapitalkosten / Zinsen bei Finanzierung</li>
              <li>Steuern auf Einspeise-Erlöse (in AT meist Pauschalierung)</li>
              <li>Inflation jenseits der Strompreis-Steigerung</li>
            </ul>
          </div>
        </div>
        <div className="mt-3 text-center">
          → Werte sind Richtwerte zur Orientierung. Endgültige Wirtschaftlichkeit hängt vom konkreten Angebot ab.
        </div>
      </footer>
    </div>
  );
}
