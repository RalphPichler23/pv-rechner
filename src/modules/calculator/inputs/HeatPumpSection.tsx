import type { FuelType, PvInputs } from "../../../lib/calc";
import { fmt, FUEL_PRESETS } from "../../../lib/calc";
import { Fieldset } from "../components/Fieldset";
import { NumberInput } from "../components/NumberInput";
import type { Setter } from "./types";

interface Props {
  input: PvInputs;
  set: Setter;
  setMany: (patch: Partial<PvInputs>) => void;
  wpHeatDemand: number;
  wpElectricity: number;
  /** WP-Toggle in der UI zeigen (false im Tab "Nur WP" – dort immer aktiv) */
  showToggle: boolean;
}

export function HeatPumpSection({
  input,
  set,
  setMany,
  wpHeatDemand,
  wpElectricity,
  showToggle,
}: Props) {
  const showFields = !showToggle || input.wpEnabled;

  return (
    <Fieldset legend="Wärmepumpe">
      {showToggle ? (
        <label className="flex items-start gap-3 rounded-xl border border-heizma-border bg-heizma-bg/60 p-3">
          <input
            type="checkbox"
            checked={input.wpEnabled}
            onChange={(e) => set("wpEnabled", e.target.checked)}
            className="mt-0.5 h-4 w-4 cursor-pointer accent-heizma-green"
          />
          <div className="flex-1">
            <div className="text-[13px] font-medium text-heizma-ink-soft">
              Wärmepumpe einbeziehen
            </div>
            <div className="mt-0.5 text-[11px] text-heizma-muted">
              Ersetzt Gas/Öl/Pellets/Strom-Heizung. WP-Strombedarf wird
              automatisch dem Verbrauch zugeschlagen.
            </div>
          </div>
        </label>
      ) : null}

      {showFields ? (
        <>
          <div className={(showToggle ? "mt-3 " : "") + "grid grid-cols-2 gap-3"}>
            <NumberInput
              label="Brennstoff-Verbrauch alt"
              unit="kWh/J"
              value={input.oldFuelDemand}
              onChange={(v) => set("oldFuelDemand", v)}
              min={0}
              step={500}
              hint="Wert von der alten Heizungsrechnung"
            />
            <NumberInput
              label="SCOP (JAZ)"
              unit=""
              value={input.wpScop}
              onChange={(v) => set("wpScop", v)}
              min={1}
              max={6}
              step={0.1}
              decimals={1}
              hint="Luft 3,5–4,0 · Sole 4,0–5,0"
            />
          </div>
          <div className="mt-3">
            <NumberInput
              label="WP-Investition (nach Förderung)"
              unit="€"
              value={input.wpInvestment}
              onChange={(v) => set("wpInvestment", v)}
              min={0}
              step={500}
              hint="AT-Förderung bis zu 25.586 €"
            />
          </div>

          <FuelBlock input={input} set={set} setMany={setMany} />

          <div className="mt-3 rounded-lg bg-heizma-green-soft/60 px-3 py-2 text-[12px] text-heizma-ink-soft">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium">Wärmebedarf des Hauses</span>
              <span className="font-bold tabular-nums text-heizma-green-dark">
                {fmt.int(wpHeatDemand)} kWh
              </span>
            </div>
            <div className="text-[11px] text-heizma-muted">
              ({fmt.int(input.oldFuelDemand)} kWh ×{" "}
              {fmt.pct(input.oldHeatingEfficiency)} Wirkungsgrad)
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-2 border-t border-heizma-border/60 pt-2">
              <span className="font-medium">WP-Strombedarf</span>
              <span className="font-bold tabular-nums text-heizma-green-dark">
                +{fmt.int(wpElectricity)} kWh/J
              </span>
            </div>
            <div className="text-[11px] text-heizma-muted">
              {fmt.int(wpHeatDemand)} kWh ÷ SCOP {input.wpScop.toFixed(1)}
            </div>
          </div>
        </>
      ) : null}
    </Fieldset>
  );
}

// --- Sub-Block: Brennstoff der alten Heizung ---

function FuelBlock({
  input,
  set,
  setMany,
}: {
  input: PvInputs;
  set: Setter;
  setMany: (patch: Partial<PvInputs>) => void;
}) {
  return (
    <div className="mt-4 rounded-xl border border-heizma-border bg-heizma-bg/40 p-3">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-heizma-muted">
        Alte Heizung (Status quo)
      </div>
      <label className="block">
        <span className="block text-[13px] font-medium text-heizma-ink-soft">
          Brennstoff
        </span>
        <select
          value={input.oldFuelType}
          onChange={(e) => {
            const t = e.target.value as FuelType;
            const preset = FUEL_PRESETS[t];
            setMany({
              oldFuelType: t,
              oldFuelPricePerKwh: preset.price,
              oldFuelPriceIncrease: preset.increase,
              oldHeatingEfficiency: preset.efficiency,
            });
          }}
          className="mt-1.5 w-full rounded-xl border border-heizma-border bg-heizma-surface px-3 py-2.5 text-base font-semibold text-heizma-ink outline-none transition focus:border-heizma-green focus:ring-2 focus:ring-heizma-green/20"
        >
          {(Object.keys(FUEL_PRESETS) as FuelType[]).map((k) => (
            <option key={k} value={k}>
              {FUEL_PRESETS[k].label}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <NumberInput
          label="Brennstoffpreis"
          unit="ct/kWh"
          value={input.oldFuelPricePerKwh * 100}
          onChange={(v) => set("oldFuelPricePerKwh", v / 100)}
          min={0}
          step={0.1}
          decimals={2}
        />
        <NumberInput
          label="Wirkungsgrad alt"
          unit="%"
          value={input.oldHeatingEfficiency * 100}
          onChange={(v) => set("oldHeatingEfficiency", v / 100)}
          min={30}
          max={120}
          step={1}
          decimals={0}
          hint="Gas ~90 · Öl ~85 · Pellets ~85"
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <NumberInput
          label="Preis-Steigerung"
          unit="%/J"
          value={input.oldFuelPriceIncrease * 100}
          onChange={(v) => set("oldFuelPriceIncrease", v / 100)}
          min={0}
          step={0.5}
          decimals={1}
        />
        <NumberInput
          label="Wartung alt"
          unit="€/J"
          value={input.oldMaintenanceCost}
          onChange={(v) => set("oldMaintenanceCost", v)}
          min={0}
          step={50}
        />
      </div>
      <div className="mt-3">
        <NumberInput
          label="Wartung WP (neu)"
          unit="€/J"
          value={input.wpMaintenanceCost}
          onChange={(v) => set("wpMaintenanceCost", v)}
          min={0}
          step={50}
        />
      </div>
    </div>
  );
}
