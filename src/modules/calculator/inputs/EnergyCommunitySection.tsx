import type { PvInputs } from "../../../lib/calc";
import { Fieldset } from "../components/Fieldset";
import { NumberInput } from "../components/NumberInput";
import type { Setter } from "./types";

interface Props {
  input: PvInputs;
  set: Setter;
}

/** EG-Block. Default-Tarife 8,4 ct (Verkauf) und 10,9 ct (Bezug). */
export function EnergyCommunitySection({ input, set }: Props) {
  return (
    <Fieldset legend="Energiegemeinschaft (EG)">
      <p className="-mt-1 mb-2 text-[11px] text-heizma-muted">
        Anteil der Einspeisung / des Bezugs, der über die EG abgewickelt wird.
        Rest läuft regulär (OeMAG bzw. Versorger).
      </p>

      <EgBlock
        title="Verkauf an EG"
        share={input.egSellShare}
        price={input.egSellPrice}
        increase={input.egSellPriceIncrease}
        onShare={(v) => set("egSellShare", Math.max(0, Math.min(1, v / 100)))}
        onPrice={(v) => set("egSellPrice", v / 100)}
        onIncrease={(v) => set("egSellPriceIncrease", v / 100)}
      />

      <div className="mt-3">
        <EgBlock
          title="Bezug aus EG"
          share={input.egBuyShare}
          price={input.egBuyPrice}
          increase={input.egBuyPriceIncrease}
          onShare={(v) => set("egBuyShare", Math.max(0, Math.min(1, v / 100)))}
          onPrice={(v) => set("egBuyPrice", v / 100)}
          onIncrease={(v) => set("egBuyPriceIncrease", v / 100)}
        />
      </div>
    </Fieldset>
  );
}

interface EgBlockProps {
  title: string;
  share: number;
  price: number;
  increase: number;
  onShare: (v: number) => void;
  onPrice: (v: number) => void;
  onIncrease: (v: number) => void;
}

function EgBlock({
  title,
  share,
  price,
  increase,
  onShare,
  onPrice,
  onIncrease,
}: EgBlockProps) {
  return (
    <div className="rounded-xl border border-heizma-border bg-heizma-bg/40 p-3">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-heizma-muted">
        {title}
      </div>
      <NumberInput
        label="Anteil"
        unit="%"
        value={share * 100}
        onChange={onShare}
        min={0}
        max={100}
        step={5}
        decimals={0}
      />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <NumberInput
          label="Tarif"
          unit="ct/kWh"
          value={price * 100}
          onChange={onPrice}
          min={0}
          step={0.1}
          decimals={2}
        />
        <NumberInput
          label="Steigerung"
          unit="%/J"
          value={increase * 100}
          onChange={onIncrease}
          min={0}
          step={0.5}
          decimals={1}
        />
      </div>
    </div>
  );
}
