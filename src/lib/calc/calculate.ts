import type { PvInputs, PvResult, YearRow } from "./types";

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

/**
 * Hauptberechnung der Amortisation.
 *
 * Modell:
 * - PV-Produktion Jahr 1: kWp × spez. Ertrag
 * - Eigenverbrauch Jahr 1: (Verbrauch + WP-Strom) × effektive Autarkie
 * - Ab Jahr 2: Strompreis steigt, PV degradiert, Eigenverbrauch skaliert mit PV
 * - WP-Strombedarf = (oldFuelDemand × Wirkungsgrad) / SCOP
 *     → Wärmebedarf des Hauses = oldFuelDemand × η (Heizma-Konvention)
 *     → WP-Strom = Wärmebedarf / SCOP
 * - Status-quo-Kosten = Haushaltsstrom + alte Heizung (falls WP aktiv)
 * - Neue Kosten      = Netzbezug + EG-Kauf − Einspeise-Erlöse + WP-Wartung
 */
export function calculate(input: PvInputs): PvResult {
  const rows: YearRow[] = [];

  // EMS-Effekte
  const emsBonus = input.emsEnabled ? input.emsAutarchyBonus : 0;
  const emsCost = input.emsEnabled ? input.emsCost : 0;
  const effectiveAutarchy = clamp(input.autarchyRate + emsBonus, 0, 0.95);

  // EG-Anteile clampen
  const egSellShare = clamp(input.egSellShare, 0, 1);
  const egBuyShare = clamp(input.egBuyShare, 0, 1);

  // Wärmepumpe – tatsächlicher Wärmebedarf = alter Brennstoff × Wirkungsgrad
  const wpHeatDemand = input.wpEnabled
    ? input.oldFuelDemand * clamp(input.oldHeatingEfficiency, 0.01, 1.2)
    : 0;
  const wpElectricity =
    input.wpEnabled && input.wpScop > 0 ? wpHeatDemand / input.wpScop : 0;
  const wpInvestment = input.wpEnabled ? input.wpInvestment : 0;

  // Zusatzverbraucher (bestehende Geräte) – NICHT doppelt zählen wenn
  // der Heizungstausch (wpEnabled) bereits aktiv ist.
  const existingWp =
    input.existingWpEnabled && !input.wpEnabled ? input.existingWpKwhPerYear : 0;
  const ev = input.evEnabled ? input.evKwhPerYear : 0;
  const pool = input.poolEnabled ? input.poolKwhPerYear : 0;
  const sauna = input.saunaEnabled ? input.saunaKwhPerYear : 0;
  const whirlpool = input.whirlpoolEnabled ? input.whirlpoolKwhPerYear : 0;
  const ac = input.acEnabled ? input.acKwhPerYear : 0;

  const effectiveConsumption =
    input.consumption + wpElectricity + existingWp + ev + pool + sauna + whirlpool + ac;

  // Gesamt-Investition
  const totalInvestment = input.investment + emsCost + wpInvestment;

  const annualProductionY1 = input.kwp * input.yieldPerKwp;
  const annualSelfY1 = effectiveConsumption * effectiveAutarchy;

  let cumulative = 0;
  let totalProduction = 0;
  let totalSelf = 0;
  let totalFeed = 0;
  let amortizationYear: number | null = null;
  let amortizationFraction: number | null = null;

  for (let i = 0; i < input.years; i++) {
    const yearNumber = i + 1;
    const priceFactor = Math.pow(1 + input.priceIncrease, i);
    const fuelFactor = Math.pow(1 + input.oldFuelPriceIncrease, i);
    const egBuyFactor = Math.pow(1 + input.egBuyPriceIncrease, i);
    const egSellFactor = Math.pow(1 + input.egSellPriceIncrease, i);
    const degradationFactor = Math.pow(1 - input.degradation, i);

    const price = input.electricityPrice * priceFactor;
    const oldFuelPrice = input.oldFuelPricePerKwh * fuelFactor;
    const egBuy = input.egBuyPrice * egBuyFactor;
    const egSell = input.egSellPrice * egSellFactor;

    const pvProduction = annualProductionY1 * degradationFactor;
    const selfConsumption = Math.min(
      annualSelfY1 * degradationFactor,
      effectiveConsumption,
      pvProduction,
    );
    const gridConsumption = Math.max(0, effectiveConsumption - selfConsumption);
    const feedIn = Math.max(0, pvProduction - selfConsumption);

    const egBoughtKwh = gridConsumption * egBuyShare;
    const regBoughtKwh = gridConsumption - egBoughtKwh;
    const egSoldKwh = feedIn * egSellShare;
    const oemagSoldKwh = feedIn - egSoldKwh;

    // Status-quo-Kosten: Haushaltsstrom (ohne WP) + alte Heizung
    const oldHeatingCost = input.wpEnabled
      ? input.oldFuelDemand * oldFuelPrice + input.oldMaintenanceCost
      : 0;
    const wpMaintenance = input.wpEnabled ? input.wpMaintenanceCost : 0;

    const costWithoutPv = input.consumption * price + oldHeatingCost;
    const costWithPv =
      regBoughtKwh * price +
      egBoughtKwh * egBuy -
      oemagSoldKwh * input.feedInTariff -
      egSoldKwh * egSell +
      wpMaintenance;

    const savings = costWithoutPv - costWithPv;
    const previousCumulative = cumulative;
    cumulative += savings;
    const netCashflow = cumulative - totalInvestment;

    if (amortizationYear === null && cumulative >= totalInvestment) {
      amortizationYear = yearNumber;
      const remaining = totalInvestment - previousCumulative;
      amortizationFraction =
        yearNumber - 1 + (savings > 0 ? remaining / savings : 0);
    }

    totalProduction += pvProduction;
    totalSelf += selfConsumption;
    totalFeed += feedIn;

    rows.push({
      year: yearNumber,
      electricityPrice: price,
      pvProduction,
      selfConsumption,
      gridConsumption,
      feedIn,
      egBoughtKwh,
      egSoldKwh,
      costWithoutPv,
      costWithPv,
      savings,
      cumulativeSavings: cumulative,
      netCashflow,
    });
  }

  const totalSavings = cumulative;
  const averageAutarchy =
    effectiveConsumption > 0
      ? totalSelf / (effectiveConsumption * input.years)
      : 0;
  const roi = totalInvestment > 0 ? totalSavings / totalInvestment : 0;

  return {
    rows,
    totalInvestment,
    totalSavings,
    amortizationYear,
    amortizationFraction,
    totalProduction,
    totalSelfConsumption: totalSelf,
    totalFeedIn: totalFeed,
    averageAutarchy,
    roi,
    wpElectricity,
    wpHeatDemand,
  };
}
