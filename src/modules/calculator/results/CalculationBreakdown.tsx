import type { PvInputs, PvResult, YearRow } from "../../../lib/calc";
import { fmt, FUEL_PRESETS } from "../../../lib/calc";
import { Group, Step } from "./breakdown/Step";

interface Props {
  input: PvInputs;
  result: PvResult;
}

/**
 * Transparenter Rechenweg für Jahr 1.
 * Zeigt Formel und konkretes Ergebnis nebeneinander – jeder Schritt
 * baut auf dem vorherigen auf und soll für Kunden nachvollziehbar sein.
 */
export function CalculationBreakdown({ input, result }: Props) {
  const r = result.rows[0];
  const showPv = input.kwp > 0;
  const showWp = input.wpEnabled;
  const showEg = input.egSellShare > 0 || input.egBuyShare > 0;

  return (
    <section className="rounded-2xl border border-heizma-border bg-heizma-surface p-5 shadow-sm">
      <header>
        <h2 className="text-base font-bold text-heizma-ink">
          So wird gerechnet (Jahr 1)
        </h2>
        <p className="mt-0.5 text-xs text-heizma-muted">
          Jeder Schritt mit Formel, eingesetzten Werten und Ergebnis – damit die
          Zahlen oben nachvollziehbar bleiben.
        </p>
      </header>

      <div className="mt-4 space-y-5">
        {showPv ? <PvSteps input={input} r={r} /> : null}
        {showWp ? <WpSteps input={input} result={result} /> : null}
        <FlowSteps input={input} result={result} r={r} />
        {showEg ? <EgSteps input={input} r={r} /> : null}
        <CostSteps input={input} r={r} showWp={showWp} />
      </div>
    </section>
  );
}

function PvSteps({ input, r }: { input: PvInputs; r: YearRow }) {
  const annualProduction = input.kwp * input.yieldPerKwp;
  return (
    <Group title="① PV-Anlage">
      <Step
        label="Jahresproduktion"
        formula={`${input.kwp} kWp × ${fmt.int(input.yieldPerKwp)} kWh/kWp`}
        result={`${fmt.int(annualProduction)} kWh`}
      />
      <Step
        label="Strompreis Jahr 1"
        formula={`${fmt.cents(input.electricityPrice)} ct/kWh (Steigerung +${(input.priceIncrease * 100).toFixed(1)} %/J)`}
        result={`${fmt.cents(r.electricityPrice)} ct/kWh`}
      />
    </Group>
  );
}

function WpSteps({ input, result }: { input: PvInputs; result: PvResult }) {
  const fuel = FUEL_PRESETS[input.oldFuelType].label;
  return (
    <Group title="② Wärmepumpe">
      <Step
        label="Tatsächlicher Wärmebedarf"
        formula={`${fmt.int(input.oldFuelDemand)} kWh ${fuel} × ${fmt.pct(input.oldHeatingEfficiency)} Wirkungsgrad`}
        result={`${fmt.int(result.wpHeatDemand)} kWh`}
      />
      <Step
        label="WP-Strombedarf"
        formula={`${fmt.int(result.wpHeatDemand)} kWh ÷ SCOP ${input.wpScop.toFixed(1)}`}
        result={`${fmt.int(result.wpElectricity)} kWh`}
        hint="Wird zum Haushaltsverbrauch addiert"
      />
    </Group>
  );
}

function FlowSteps({
  input,
  result,
  r,
}: {
  input: PvInputs;
  result: PvResult;
  r: YearRow;
}) {
  // Alle Stromverbraucher zusammenrechnen für die Anzeige
  const parts: string[] = [`${fmt.int(input.consumption)} kWh Haushalt`];
  if (result.wpElectricity > 0)
    parts.push(`${fmt.int(result.wpElectricity)} kWh WP-Tausch`);
  if (input.existingWpEnabled && !input.wpEnabled && input.existingWpKwhPerYear > 0)
    parts.push(`${fmt.int(input.existingWpKwhPerYear)} kWh best. WP`);
  if (input.evEnabled && input.evKwhPerYear > 0)
    parts.push(`${fmt.int(input.evKwhPerYear)} kWh E-Auto`);
  if (input.poolEnabled && input.poolKwhPerYear > 0)
    parts.push(`${fmt.int(input.poolKwhPerYear)} kWh Pool`);
  if (input.acEnabled && input.acKwhPerYear > 0)
    parts.push(`${fmt.int(input.acKwhPerYear)} kWh Klima`);
  if (input.saunaEnabled && input.saunaKwhPerYear > 0)
    parts.push(`${fmt.int(input.saunaKwhPerYear)} kWh Sauna`);
  if (input.whirlpoolEnabled && input.whirlpoolKwhPerYear > 0)
    parts.push(`${fmt.int(input.whirlpoolKwhPerYear)} kWh Whirlpool`);
  const effectiveCons =
    r.gridConsumption + r.selfConsumption; // = realer Gesamtverbrauch
  const emsActive = input.emsEnabled && input.emsAutarchyBonus > 0;
  const effAutarchy = Math.min(
    0.95,
    input.autarchyRate + (emsActive ? input.emsAutarchyBonus : 0),
  );
  return (
    <Group title="③ Stromfluss">
      <Step
        label="Effektiver Stromverbrauch"
        formula={parts.join(" + ")}
        result={`${fmt.int(effectiveCons)} kWh`}
      />
      {emsActive ? (
        <Step
          label="Effektive Autarkie"
          formula={`${fmt.pct(input.autarchyRate)} + ${fmt.pct(input.emsAutarchyBonus)} EMS-Bonus`}
          result={fmt.pct(effAutarchy)}
        />
      ) : null}
      <Step
        label="Eigenverbrauch"
        formula={`${fmt.int(effectiveCons)} kWh × ${fmt.pct(effAutarchy)}`}
        result={`${fmt.int(r.selfConsumption)} kWh`}
        hint="Direkt aus der PV genutzt, kein Stromkauf nötig"
      />
      <Step
        label="Netzbezug"
        formula={`${fmt.int(effectiveCons)} kWh − ${fmt.int(r.selfConsumption)} kWh`}
        result={`${fmt.int(r.gridConsumption)} kWh`}
      />
      {input.kwp > 0 ? (
        <Step
          label="Einspeisung"
          formula={`${fmt.int(input.kwp * input.yieldPerKwp)} kWh PV − ${fmt.int(r.selfConsumption)} kWh Eigenverbrauch`}
          result={`${fmt.int(r.feedIn)} kWh`}
        />
      ) : null}
    </Group>
  );
}

function EgSteps({ input, r }: { input: PvInputs; r: YearRow }) {
  return (
    <Group title="④ Energiegemeinschaft (EG)">
      {input.egSellShare > 0 ? (
        <Step
          label={`Verkauf an EG (${(input.egSellShare * 100).toFixed(0)} %)`}
          formula={`${fmt.int(r.feedIn)} kWh × ${(input.egSellShare * 100).toFixed(0)} % @ ${fmt.cents(input.egSellPrice)} ct`}
          result={fmt.eur(r.egSoldKwh * input.egSellPrice)}
        />
      ) : null}
      {input.egBuyShare > 0 ? (
        <Step
          label={`Bezug aus EG (${(input.egBuyShare * 100).toFixed(0)} %)`}
          formula={`${fmt.int(r.gridConsumption)} kWh × ${(input.egBuyShare * 100).toFixed(0)} % @ ${fmt.cents(input.egBuyPrice)} ct`}
          result={fmt.eur(r.egBoughtKwh * input.egBuyPrice)}
        />
      ) : null}
    </Group>
  );
}

function CostSteps({
  input,
  r,
  showWp,
}: {
  input: PvInputs;
  r: YearRow;
  showWp: boolean;
}) {
  // Status-quo-Strom inkl. Zusatzverbrauchern (außer WP-Tausch — der läuft
  // im Status quo noch nicht)
  const existingWp =
    input.existingWpEnabled && !input.wpEnabled ? input.existingWpKwhPerYear : 0;
  const ev = input.evEnabled ? input.evKwhPerYear : 0;
  const pool = input.poolEnabled ? input.poolKwhPerYear : 0;
  const sauna = input.saunaEnabled ? input.saunaKwhPerYear : 0;
  const whirlpool = input.whirlpoolEnabled ? input.whirlpoolKwhPerYear : 0;
  const ac = input.acEnabled ? input.acKwhPerYear : 0;
  const statusQuoElectricity =
    input.consumption + existingWp + ev + pool + sauna + whirlpool + ac;
  const householdStromCost = statusQuoElectricity * r.electricityPrice;
  const oldHeatingCost = showWp
    ? input.oldFuelDemand * input.oldFuelPricePerKwh + input.oldMaintenanceCost
    : 0;
  const regBoughtKwh = r.gridConsumption - r.egBoughtKwh;
  const oemagSoldKwh = r.feedIn - r.egSoldKwh;
  const buyReg = regBoughtKwh * r.electricityPrice;
  const buyEg = r.egBoughtKwh * input.egBuyPrice;
  const sellOemag = oemagSoldKwh * input.feedInTariff;
  const sellEg = r.egSoldKwh * input.egSellPrice;
  const wpMaint = showWp ? input.wpMaintenanceCost : 0;
  const fuelLabel = FUEL_PRESETS[input.oldFuelType].label;

  return (
    <Group title="⑤ Kosten & Ersparnis">
      <Step
        label="Status quo: Strom (Haushalt + bestehende Verbraucher)"
        formula={`${fmt.int(statusQuoElectricity)} kWh × ${fmt.cents(r.electricityPrice)} ct`}
        result={fmt.eur(householdStromCost)}
      />
      {showWp ? (
        <Step
          label={`Status quo: Alte Heizung (${fuelLabel})`}
          formula={`${fmt.int(input.oldFuelDemand)} kWh × ${fmt.cents(input.oldFuelPricePerKwh)} ct + ${fmt.eur(input.oldMaintenanceCost)} Wartung`}
          result={fmt.eur(oldHeatingCost)}
        />
      ) : null}
      <Step
        label="Σ Kosten ohne PV"
        formula="Haushaltsstrom + alte Heizung"
        result={fmt.eur(r.costWithoutPv)}
      />

      <div className="my-2 border-t border-heizma-border/60" />

      {buyReg > 0 ? (
        <Step
          label="Netzbezug (regulär)"
          formula={`${fmt.int(regBoughtKwh)} kWh × ${fmt.cents(r.electricityPrice)} ct`}
          result={`+${fmt.eur(buyReg)}`}
        />
      ) : null}
      {buyEg > 0 ? (
        <Step
          label="Bezug aus EG"
          formula={`${fmt.int(r.egBoughtKwh)} kWh × ${fmt.cents(input.egBuyPrice)} ct`}
          result={`+${fmt.eur(buyEg)}`}
        />
      ) : null}
      {sellOemag > 0 ? (
        <Step
          label="Einspeise-Erlös (OeMAG)"
          formula={`${fmt.int(oemagSoldKwh)} kWh × ${fmt.cents(input.feedInTariff)} ct`}
          result={`−${fmt.eur(sellOemag)}`}
        />
      ) : null}
      {sellEg > 0 ? (
        <Step
          label="Erlös aus EG-Verkauf"
          formula={`${fmt.int(r.egSoldKwh)} kWh × ${fmt.cents(input.egSellPrice)} ct`}
          result={`−${fmt.eur(sellEg)}`}
        />
      ) : null}
      {showWp ? (
        <Step
          label="Wartung WP"
          formula="pauschal"
          result={`+${fmt.eur(wpMaint)}`}
        />
      ) : null}
      <Step
        label="Σ Kosten mit PV / WP"
        formula="Netzbezug − Einspeise-Erlöse + Wartung WP"
        result={fmt.eur(r.costWithPv)}
      />

      <div className="my-2 border-t border-heizma-border/60" />

      <Step
        label="Ersparnis Jahr 1"
        formula={`${fmt.eur(r.costWithoutPv)} − ${fmt.eur(r.costWithPv)}`}
        result={fmt.eur(r.savings)}
        highlight
      />
    </Group>
  );
}
