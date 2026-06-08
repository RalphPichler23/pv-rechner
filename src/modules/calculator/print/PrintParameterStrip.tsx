import type { PvInputs, TabMode } from "../../../lib/calc";
import { fmt, FUEL_PRESETS } from "../../../lib/calc";

interface Props {
  input: PvInputs;
  tab: TabMode;
}

export function PrintParameterStrip({ input, tab }: Props) {
  const items: { label: string; value: string }[] = [];

  if (tab !== "wp") {
    items.push(
      { label: "Anlage", value: `${input.kwp} kWp · ${fmt.int(input.yieldPerKwp)} kWh/kWp` },
      { label: "Speicher", value: `${input.storageKwh.toFixed(1)} kWh` },
      { label: "Autarkie", value: fmt.pct(input.autarchyRate) },
      { label: "Strompreis", value: `${fmt.cents(input.electricityPrice)} ct/kWh` },
      { label: "Einspeisetarif", value: `${fmt.cents(input.feedInTariff)} ct/kWh` },
      { label: "Preissteigerung", value: `${(input.priceIncrease * 100).toFixed(1)} %/J` },
      {
        label: "EMS (Optima)",
        value: input.emsEnabled
          ? `aktiv · +${fmt.pct(input.emsAutarchyBonus)}`
          : "—",
      },
      {
        label: "EG Verkauf",
        value:
          input.egSellShare > 0
            ? `${(input.egSellShare * 100).toFixed(0)} % @ ${fmt.cents(input.egSellPrice)} ct`
            : "—",
      },
      {
        label: "EG Bezug",
        value:
          input.egBuyShare > 0
            ? `${(input.egBuyShare * 100).toFixed(0)} % @ ${fmt.cents(input.egBuyPrice)} ct`
            : "—",
      },
    );
  }

  items.push({ label: "Jahresverbrauch", value: `${fmt.int(input.consumption)} kWh` });

  if (tab !== "pv" && input.wpEnabled) {
    items.push(
      {
        label: "Brennstoff alt",
        value: `${FUEL_PRESETS[input.oldFuelType].label} · ${fmt.int(input.oldFuelDemand)} kWh @ ${fmt.cents(input.oldFuelPricePerKwh)} ct`,
      },
      {
        label: "Wirkungsgrad alt",
        value: fmt.pct(input.oldHeatingEfficiency),
      },
      {
        label: "WP SCOP",
        value: input.wpScop.toFixed(1),
      },
    );
  }

  items.push({
    label: "Investition gesamt",
    value: fmt.eur(
      input.investment +
        (input.emsEnabled ? input.emsCost : 0) +
        (input.wpEnabled ? input.wpInvestment : 0),
    ),
  });

  return (
    <dl className="mt-3 grid grid-cols-4 gap-x-3 gap-y-1.5 text-[10.5px]">
      {items.map((it) => (
        <div
          key={it.label}
          className="flex items-baseline justify-between gap-2 border-b border-heizma-border/60 pb-1"
        >
          <dt className="text-heizma-muted">{it.label}</dt>
          <dd className="font-semibold tabular-nums text-heizma-ink">
            {it.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
