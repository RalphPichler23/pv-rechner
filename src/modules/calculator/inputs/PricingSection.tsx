import type { PvInputs } from "../../../lib/calc";
import { Fieldset } from "../components/Fieldset";
import { NumberInput } from "../components/NumberInput";
import type { Setter } from "./types";

interface Props {
  input: PvInputs;
  set: Setter;
  /** ob die PV-bezogenen Preise (Einspeisetarif) angezeigt werden sollen */
  showPv: boolean;
}

export function PricingSection({ input, set, showPv }: Props) {
  // Gesamt-Stromverbrauch (Status quo) für die Jahresrechnungs-Anzeige:
  // Haushalt + bestehende Zusatzverbraucher. NEUE WP (wpEnabled) gehört NICHT
  // dazu – im Status quo läuft dort die alte Heizung.
  const existingWp =
    input.existingWpEnabled && !input.wpEnabled ? input.existingWpKwhPerYear : 0;
  const ev = input.evEnabled ? input.evKwhPerYear : 0;
  const pool = input.poolEnabled ? input.poolKwhPerYear : 0;
  const sauna = input.saunaEnabled ? input.saunaKwhPerYear : 0;
  const whirlpool = input.whirlpoolEnabled ? input.whirlpoolKwhPerYear : 0;
  const ac = input.acEnabled ? input.acKwhPerYear : 0;
  const totalStatusQuo =
    input.consumption + existingWp + ev + pool + sauna + whirlpool + ac;
  const yearBill = totalStatusQuo * input.electricityPrice;

  return (
    <>
      <Fieldset legend="Preise & Tarife">
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Strompreis"
            unit="ct/kWh"
            value={input.electricityPrice * 100}
            onChange={(v) => set("electricityPrice", v / 100)}
            min={0}
            step={0.5}
            decimals={2}
          />
          <NumberInput
            label="Jahres-Stromrechnung"
            unit="€/J"
            value={yearBill}
            onChange={(v) => {
              if (totalStatusQuo <= 0) return;
              set("electricityPrice", v / totalStatusQuo);
            }}
            min={0}
            step={50}
            decimals={0}
            hint={`Für ${Math.round(totalStatusQuo).toLocaleString("de-AT")} kWh Verbrauch/J`}
          />
        </div>
        {showPv ? (
          <div className="mt-3">
            <NumberInput
              label="Einspeisetarif"
              unit="ct/kWh"
              value={input.feedInTariff * 100}
              onChange={(v) => set("feedInTariff", v / 100)}
              min={0}
              step={0.1}
              decimals={2}
            />
          </div>
        ) : null}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <NumberInput
            label="Strompreis-Steigerung"
            unit="%/J"
            value={input.priceIncrease * 100}
            onChange={(v) => set("priceIncrease", v / 100)}
            min={0}
            step={0.1}
            decimals={1}
          />
          {showPv ? (
            <NumberInput
              label="PV-Degradation"
              unit="%/J"
              value={input.degradation * 100}
              onChange={(v) => set("degradation", v / 100)}
              min={0}
              step={0.1}
              decimals={1}
            />
          ) : null}
        </div>
        <div className="mt-3">
          <NumberInput
            label="Betrachtungszeitraum"
            unit="Jahre"
            value={input.years}
            onChange={(v) => set("years", Math.max(1, Math.round(v)))}
            min={1}
            max={40}
            step={1}
            decimals={0}
          />
        </div>

        {/* Dynamische Stromtarife */}
        <div className="mt-4 border-t border-heizma-border pt-4">
          <label className="flex items-start gap-3 rounded-xl border border-heizma-border bg-heizma-bg/60 p-3">
            <input
              type="checkbox"
              checked={input.dynamicTariffEnabled}
              onChange={(e) => set("dynamicTariffEnabled", e.target.checked)}
              className="mt-0.5 h-4 w-4 cursor-pointer accent-heizma-green"
            />
            <div className="flex-1">
              <div className="text-[13px] font-medium text-heizma-ink-soft">
                ⚡ Dynamische Stromtarife (aWattar, Tibber …)
              </div>
              <div className="mt-0.5 text-[11px] text-heizma-muted">
                aWattar Hourly, Tibber & Co. – das EMS lädt den Speicher in
                günstigen Spotpreis-Stunden aus dem Netz auf und verschiebt
                steuerbare Verbraucher (WP, Wallbox). Reduziert den effektiven
                Netzbezugs­preis.
              </div>
            </div>
          </label>
          {input.dynamicTariffEnabled ? (
            <div className="mt-3">
              <NumberInput
                label="Rabatt auf Netzbezug"
                unit="%"
                value={input.dynamicTariffDiscount * 100}
                onChange={(v) => set("dynamicTariffDiscount", v / 100)}
                min={0}
                max={30}
                step={1}
                decimals={0}
                hint="aWattar Hourly historisch −10 % bis −15 %"
              />
            </div>
          ) : null}
        </div>
      </Fieldset>
    </>
  );
}
