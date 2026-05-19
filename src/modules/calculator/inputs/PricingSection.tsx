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
          {showPv ? (
            <NumberInput
              label="Einspeisetarif"
              unit="ct/kWh"
              value={input.feedInTariff * 100}
              onChange={(v) => set("feedInTariff", v / 100)}
              min={0}
              step={0.1}
              decimals={2}
            />
          ) : null}
        </div>
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
      </Fieldset>
    </>
  );
}
