import type { PvInputs } from "../../../lib/calc";
import { fmt } from "../../../lib/calc";
import { Fieldset } from "../components/Fieldset";
import { NumberInput } from "../components/NumberInput";
import type { Setter } from "./types";

interface Props {
  input: PvInputs;
  set: Setter;
  setMany: (patch: Partial<PvInputs>) => void;
}

/**
 * "Habe schon eine PV-Anlage" — nur im WP-Tab.
 * Die bestehende Anlage senkt die WP-Stromkosten durch PV-Eigenverbrauch.
 * KEINE Investition (weil schon da).
 */
export function ExistingPvSection({ input, set, setMany }: Props) {
  const annualProduction = input.kwp * input.yieldPerKwp;

  const onToggle = (enabled: boolean) => {
    if (enabled) {
      // Bei Aktivierung: sinnvolle Defaults wenn noch keine eingegeben
      setMany({
        existingPvEnabled: true,
        kwp: input.kwp > 0 ? input.kwp : 10,
        yieldPerKwp: input.yieldPerKwp > 0 ? input.yieldPerKwp : 1075,
        storageKwh: input.storageKwh,
        investment: 0, // bestehend = keine Investition
      });
    } else {
      // Bei Deaktivierung: PV-Felder zurücksetzen
      setMany({
        existingPvEnabled: false,
        kwp: 0,
        investment: 0,
      });
    }
  };

  const onAnnualProductionChange = (kwhPerYear: number) => {
    if (input.kwp <= 0) return;
    set("yieldPerKwp", kwhPerYear / input.kwp);
  };

  return (
    <Fieldset legend="Bestehende PV-Anlage">
      <label className="flex items-start gap-3 rounded-xl border border-heizma-border bg-heizma-bg/60 p-3">
        <input
          type="checkbox"
          checked={input.existingPvEnabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-0.5 h-4 w-4 cursor-pointer accent-heizma-green"
        />
        <div className="flex-1">
          <div className="text-[13px] font-medium text-heizma-ink-soft">
            ☀️ PV-Anlage bereits vorhanden
          </div>
          <div className="mt-0.5 text-[11px] text-heizma-muted">
            Senkt die WP-Stromkosten durch Eigenverbrauch. Keine zusätzliche
            Investition – die Anlage ist ja schon da.
          </div>
        </div>
      </label>

      {input.existingPvEnabled ? (
        <>
          <div className="mt-3">
            <NumberInput
              label="Anlagengröße"
              unit="kWp"
              value={input.kwp}
              onChange={(v) => set("kwp", v)}
              min={0}
              step={0.5}
              decimals={1}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <NumberInput
              label="Erwarteter Jahresertrag"
              unit="kWh/J"
              value={annualProduction}
              onChange={onAnnualProductionChange}
              min={0}
              step={100}
              decimals={0}
              hint="Wert aus PV-Monitoring"
            />
            <NumberInput
              label="Spez. Ertrag"
              unit="kWh/kWp"
              value={input.yieldPerKwp}
              onChange={(v) => set("yieldPerKwp", v)}
              min={0}
              step={25}
              decimals={0}
              hint="AT typ. 950–1.150"
            />
          </div>
          <div className="mt-3">
            <NumberInput
              label="Batteriespeicher"
              unit="kWh"
              value={input.storageKwh}
              onChange={(v) => set("storageKwh", v)}
              min={0}
              step={1}
              decimals={1}
              hint="0 = ohne Speicher"
            />
          </div>
          <div className="mt-3 rounded-lg bg-heizma-green-soft/60 px-3 py-2 text-[12px] text-heizma-ink-soft">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium">PV produziert</span>
              <span className="font-bold tabular-nums text-heizma-green-dark">
                {fmt.int(annualProduction)} kWh/J
              </span>
            </div>
            <div className="text-[11px] text-heizma-muted">
              Davon wird ein Teil zur Deckung des WP-Strombedarfs verwendet.
            </div>
          </div>
        </>
      ) : null}
    </Fieldset>
  );
}
