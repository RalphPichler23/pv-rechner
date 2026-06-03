import type { PvInputs } from "../../../lib/calc";
import { Fieldset } from "../components/Fieldset";
import { NumberInput } from "../components/NumberInput";
import type { Setter } from "./types";

interface Props {
  input: PvInputs;
  set: Setter;
}

export function EmsSection({ input, set }: Props) {
  return (
    <Fieldset legend="Energiemanagement (Optima)">
      <label className="flex items-start gap-3 rounded-xl border border-heizma-border bg-heizma-bg/60 p-3">
        <input
          type="checkbox"
          checked={input.emsEnabled}
          onChange={(e) => set("emsEnabled", e.target.checked)}
          className="mt-0.5 h-4 w-4 cursor-pointer accent-heizma-green"
        />
        <div className="flex-1">
          <div className="text-[13px] font-medium text-heizma-ink-soft">
            EMS aktivieren
          </div>
          <div className="mt-0.5 text-[11px] text-heizma-muted">
            Steuert Wärmepumpe, Wallbox & Speicher und hebt damit den
            Eigendeckungsgrad an. Lohnt sich vor allem mit WP oder Wallbox –
            bei reiner PV-Anlage kann die EMS-Investition die Amortisation
            leicht verlängern.
          </div>
        </div>
      </label>
      {input.emsEnabled ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <NumberInput
            label="Autarkie-Bonus"
            unit="%-Punkte"
            value={input.emsAutarchyBonus * 100}
            onChange={(v) => set("emsAutarchyBonus", v / 100)}
            min={0}
            max={30}
            step={1}
            decimals={0}
            hint="Optima typ. +5 – 15 PP"
          />
          <NumberInput
            label="EMS-Investition"
            unit="€"
            value={input.emsCost}
            onChange={(v) => set("emsCost", v)}
            min={0}
            step={100}
          />
        </div>
      ) : null}
    </Fieldset>
  );
}
