import type { PvInputs } from "../../../lib/calc";
import { fmt, recommendedAutarchy } from "../../../lib/calc";
import { Fieldset } from "../components/Fieldset";
import { NumberInput } from "../components/NumberInput";
import type { Setter } from "./types";

interface Props {
  input: PvInputs;
  set: Setter;
  wpElectricity: number;
}

export function ConsumptionSection({ input, set, wpElectricity }: Props) {
  const suggested = recommendedAutarchy(
    input.consumption,
    input.storageKwh,
    wpElectricity,
  );
  const matches = Math.abs(input.autarchyRate - suggested) < 0.01;

  return (
    <Fieldset legend="Verbrauch & Eigennutzung">
      <NumberInput
        label="Jahresstromverbrauch (Haushalt ohne WP)"
        unit="kWh"
        value={input.consumption}
        onChange={(v) => set("consumption", v)}
        min={0}
        step={500}
      />
      <div className="mt-3">
        <NumberInput
          label="Eigendeckungsgrad (Anteil des Verbrauchs durch PV)"
          unit="%"
          value={input.autarchyRate * 100}
          onChange={(v) => set("autarchyRate", v / 100)}
          min={0}
          max={100}
          step={1}
          decimals={0}
        />
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="text-heizma-muted">
            Empfehlung für {input.storageKwh.toFixed(1)} kWh Speicher
            {wpElectricity > 0 ? " + WP" : ""}:{" "}
            <span className="font-semibold text-heizma-ink-soft">
              {fmt.pct(suggested)}
            </span>
          </span>
          {!matches ? (
            <button
              type="button"
              onClick={() => set("autarchyRate", suggested)}
              className="rounded-md border border-heizma-green/40 bg-heizma-green-soft/60 px-2 py-0.5 text-[11px] font-medium text-heizma-green-dark hover:bg-heizma-green/15"
            >
              Übernehmen
            </button>
          ) : (
            <span className="rounded-md bg-heizma-green-soft/60 px-2 py-0.5 text-[11px] font-medium text-heizma-green-dark">
              ✓ Empfehlung übernommen
            </span>
          )}
        </div>
        {input.emsEnabled && input.emsAutarchyBonus > 0 ? (
          <div className="mt-1 text-[11px] text-heizma-green-dark">
            + EMS-Bonus {fmt.pct(input.emsAutarchyBonus)} → effektiv{" "}
            <span className="font-semibold">
              {fmt.pct(Math.min(0.95, input.autarchyRate + input.emsAutarchyBonus))}
            </span>
          </div>
        ) : null}
      </div>
    </Fieldset>
  );
}
