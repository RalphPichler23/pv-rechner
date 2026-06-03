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
  const pvProduction = input.kwp * input.yieldPerKwp;
  const ev = input.evEnabled ? input.evKwhPerYear : 0;
  const existingWp =
    input.existingWpEnabled && !input.wpEnabled ? input.existingWpKwhPerYear : 0;
  const pool = input.poolEnabled ? input.poolKwhPerYear : 0;
  const sauna = input.saunaEnabled ? input.saunaKwhPerYear : 0;
  const whirlpool = input.whirlpoolEnabled ? input.whirlpoolKwhPerYear : 0;
  const ac = input.acEnabled ? input.acKwhPerYear : 0;
  const suggested = recommendedAutarchy(
    input.consumption,
    input.storageKwh,
    wpElectricity,
    pvProduction,
    ev,
    existingWp,
    pool,
    sauna,
    whirlpool,
    ac,
  );
  const matches = Math.abs(input.autarchyRate - suggested) < 0.01;
  // Physikalisches Maximum für UI-Warnung
  const totalConsumption =
    input.consumption + wpElectricity + ev + existingWp + pool + sauna + whirlpool + ac;
  const physicalMax = pvProduction > 0 && totalConsumption > 0
    ? (pvProduction * 0.95) / totalConsumption
    : 1;
  const overPhysicalMax = input.autarchyRate > physicalMax + 0.005;

  return (
    <Fieldset legend="Verbrauch & Eigennutzung">
      <NumberInput
        label="Jahresstromverbrauch (Haushalt)"
        unit="kWh"
        value={input.consumption}
        onChange={(v) => set("consumption", v)}
        min={0}
        step={500}
        hint="Ohne WP / E-Auto – die kommen unten als Zusatzverbraucher dazu"
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
            Empfehlung
            {(() => {
              const parts: string[] = [`${input.storageKwh.toFixed(1)} kWh Speicher`];
              if (wpElectricity > 0) parts.push("WP");
              if (existingWp > 0) parts.push("best. WP");
              if (ev > 0) parts.push("E-Auto");
              if (pool > 0) parts.push("Pool");
              if (ac > 0) parts.push("Klima");
              if (sauna > 0) parts.push("Sauna");
              if (whirlpool > 0) parts.push("Whirlpool");
              return ` für ${parts.join(" + ")}: `;
            })()}
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
        {overPhysicalMax && pvProduction > 0 ? (
          <div className="mt-1 rounded-md bg-heizma-red-soft/60 px-2 py-1 text-[11px] text-heizma-red">
            ⚠ PV-Anlage zu klein: max. {fmt.pct(physicalMax)} möglich
            ({fmt.int(pvProduction)} kWh Produktion vs. {fmt.int(totalConsumption)} kWh Bedarf).
            Höhere Werte ändern die Berechnung nicht.
          </div>
        ) : null}
      </div>
    </Fieldset>
  );
}
