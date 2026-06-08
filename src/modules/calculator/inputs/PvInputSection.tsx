import type { PvInputs } from "../../../lib/calc";
import { fmt } from "../../../lib/calc";
import { Fieldset } from "../components/Fieldset";
import { NumberInput } from "../components/NumberInput";
import type { Setter } from "./types";

interface Props {
  input: PvInputs;
  set: Setter;
  totalInvestment: number;
}

/** PV-Anlage inkl. Speicher (Komplettpaket). */
export function PvInputSection({ input, set, totalInvestment }: Props) {
  const annualProduction = input.kwp * input.yieldPerKwp;

  // Jahresertrag direkt eingeben → spez. Ertrag wird daraus abgeleitet.
  const onAnnualProductionChange = (kwhPerYear: number) => {
    if (input.kwp <= 0) return;
    set("yieldPerKwp", kwhPerYear / input.kwp);
  };

  return (
    <Fieldset legend="PV-Anlage & Speicher">
      <NumberInput
        label="Anlagengröße"
        unit="kWp"
        value={input.kwp}
        onChange={(v) => set("kwp", v)}
        min={0}
        step={0.5}
        decimals={1}
      />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <NumberInput
          label="Erwarteter Jahresertrag"
          unit="kWh/J"
          value={annualProduction}
          onChange={onAnnualProductionChange}
          min={0}
          step={100}
          decimals={0}
          hint="Wert aus PV-Angebot / Monitoring"
        />
        <NumberInput
          label="Spez. Ertrag"
          unit="kWh/kWp"
          value={input.yieldPerKwp}
          onChange={(v) => set("yieldPerKwp", v)}
          min={0}
          step={25}
          decimals={0}
          hint="AT typisch 950 – 1.150"
        />
      </div>
      <div className="mt-3">
        <NumberInput
          label="Speichergröße (für Autarkie-Berechnung)"
          unit="kWh"
          value={input.storageKwh}
          onChange={(v) => set("storageKwh", v)}
          min={0}
          step={1}
          decimals={1}
          hint="0 = ohne Speicher · Wirkt auf die empfohlene Autarkie"
        />
      </div>
      <div className="mt-3">
        <NumberInput
          label="PV-Investition gesamt (inkl. Speicher, nach Förderung)"
          unit="€"
          value={input.investment}
          onChange={(v) => set("investment", v)}
          min={0}
          step={500}
        />
      </div>
      <div className="mt-3 rounded-lg bg-heizma-green-soft/60 px-3 py-2 text-[12px] text-heizma-ink-soft">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-medium">Gesamt-Investition</span>
          <span className="font-bold tabular-nums text-heizma-green-dark">
            {fmt.eur(totalInvestment)}
          </span>
        </div>
      </div>
    </Fieldset>
  );
}
