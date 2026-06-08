import type { PvInputs } from "../../../lib/calc";
import { fmt } from "../../../lib/calc";
import { Fieldset } from "../components/Fieldset";
import { NumberInput } from "../components/NumberInput";
import type { Setter } from "./types";

interface Props {
  input: PvInputs;
  set: Setter;
  wpElectricity: number;
}

/**
 * Verbrauch + Anzeige der automatisch berechneten Autarkie und
 * Eigenverbrauchsquote. Beide Werte werden in `PvCalculator.tsx` via
 * `useEffect` aus den anderen Inputs abgeleitet (Speicher, Zusatzverbraucher,
 * PV-Größe). Die Sättigung bei großem Speicher / kleinem Verbrauch ist
 * bereits in der HTW-Berlin-Approximation enthalten (e^(-1,5·ratio)).
 */
export function ConsumptionSection({ input, set, wpElectricity }: Props) {
  const pvProduction = input.kwp * input.yieldPerKwp;
  const ev = input.evEnabled ? input.evKwhPerYear : 0;
  const existingWp =
    input.existingWpEnabled && !input.wpEnabled ? input.existingWpKwhPerYear : 0;
  const pool = input.poolEnabled ? input.poolKwhPerYear : 0;
  const sauna = input.saunaEnabled ? input.saunaKwhPerYear : 0;
  const whirlpool = input.whirlpoolEnabled ? input.whirlpoolKwhPerYear : 0;
  const ac = input.acEnabled ? input.acKwhPerYear : 0;
  const totalConsumption =
    input.consumption + wpElectricity + ev + existingWp + pool + sauna + whirlpool + ac;

  // EMS-Bonus mit einrechnen, damit die Anzeige dem effektiven Wert
  // entspricht, den der Rechenweg unten verwendet.
  const emsBonus = input.emsEnabled ? input.emsAutarchyBonus : 0;
  const autarchy = Math.min(0.95, input.autarchyRate + emsBonus);
  const selfConsumption = Math.min(totalConsumption * autarchy, pvProduction);
  const selfConsumptionRate =
    pvProduction > 0 ? selfConsumption / pvProduction : 0;

  // Liste der aktiven Verbraucher für den Hinweistext
  const parts: string[] = [];
  if (input.storageKwh > 0) parts.push(`${input.storageKwh.toFixed(1)} kWh Speicher`);
  if (wpElectricity > 0) parts.push("WP");
  if (existingWp > 0) parts.push("best. WP");
  if (ev > 0) parts.push("E-Auto");
  if (pool > 0) parts.push("Pool");
  if (ac > 0) parts.push("Klima");
  if (sauna > 0) parts.push("Sauna");
  if (whirlpool > 0) parts.push("Whirlpool");

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

      {/* Auto-berechnete Werte – nur sinnvoll wenn PV-Anlage da ist */}
      {pvProduction > 0 ? (
        <div className="mt-3 rounded-xl border border-heizma-green/30 bg-heizma-green-soft/40 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-heizma-green-dark">
            Automatisch berechnet
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <ReadOnlyMetric
              label="Autarkiegrad"
              value={fmt.pct(autarchy)}
              hint="Anteil des Verbrauchs durch PV"
            />
            <ReadOnlyMetric
              label="Eigenverbrauchsquote"
              value={fmt.pct(selfConsumptionRate)}
              hint="Anteil der PV-Produktion selbst genutzt"
            />
          </div>
          {parts.length > 0 ? (
            <div className="mt-2 text-[11px] text-heizma-muted">
              Basiert auf: {parts.join(" + ")}
              {emsBonus > 0
                ? ` · inkl. EMS-Bonus +${fmt.pct(emsBonus)}`
                : ""}
            </div>
          ) : null}
        </div>
      ) : null}
    </Fieldset>
  );
}

interface MetricProps {
  label: string;
  value: string;
  hint?: string;
}

function ReadOnlyMetric({ label, value, hint }: MetricProps) {
  return (
    <div>
      <div className="text-[11px] font-medium text-heizma-ink-soft">{label}</div>
      <div className="mt-0.5 text-2xl font-extrabold tabular-nums text-heizma-green-dark">
        {value}
      </div>
      {hint ? (
        <div className="mt-0.5 text-[10.5px] text-heizma-muted">{hint}</div>
      ) : null}
    </div>
  );
}
