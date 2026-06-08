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
          extraCharges={input.egBuyExtraCharges}
          onShare={(v) => set("egBuyShare", Math.max(0, Math.min(1, v / 100)))}
          onPrice={(v) => set("egBuyPrice", v / 100)}
          onIncrease={(v) => set("egBuyPriceIncrease", v / 100)}
          onExtraCharges={(v) => set("egBuyExtraCharges", v / 100)}
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
  extraCharges?: number;
  onShare: (v: number) => void;
  onPrice: (v: number) => void;
  onIncrease: (v: number) => void;
  onExtraCharges?: (v: number) => void;
}

function EgBlock({
  title,
  share,
  price,
  increase,
  extraCharges,
  onShare,
  onPrice,
  onIncrease,
  onExtraCharges,
}: EgBlockProps) {
  const showExtras = extraCharges !== undefined && onExtraCharges !== undefined;
  const effectivePrice = price + (extraCharges || 0);
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
          label={showExtras ? "Energie-Tarif" : "Tarif"}
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
      {showExtras ? (
        <>
          <div className="mt-3">
            <NumberInput
              label="Netz & Steuern (Aufschlag)"
              unit="ct/kWh"
              value={extraCharges! * 100}
              onChange={onExtraCharges!}
              min={0}
              step={0.1}
              decimals={2}
              hint="AT 2026: Netzentgelte + E-Abgabe + USt ≈ 7 ct/kWh"
            />
          </div>
          <div className="mt-3 rounded-lg bg-heizma-green-soft/60 px-3 py-1.5 text-[11px] text-heizma-ink-soft">
            Effektiver Bezugspreis (Jahr 1):
            <span className="ml-1 font-bold text-heizma-green-dark">
              {(effectivePrice * 100).toFixed(2)} ct/kWh
            </span>
            <span className="text-heizma-muted">
              {" "}({(price * 100).toFixed(2)} + {((extraCharges || 0) * 100).toFixed(2)} ct)
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
