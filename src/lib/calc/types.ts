/**
 * Typen für den Heizma PV+WP-Amortisationsrechner.
 */

export type TabMode = "pv" | "wp" | "combined";

export type FuelType = "gas" | "oil" | "pellets" | "wood" | "coal" | "electric" | "other";

export interface PvInputs {
  // ---- PV-Anlage ----
  /** Anlagengröße in kWp */
  kwp: number;
  /** spezifischer Jahresertrag in kWh pro kWp (typ. AT: 950–1150) */
  yieldPerKwp: number;
  /**
   * Investitionssumme PV-Anlage (netto, nach Förderung) in €.
   * Inklusive Speicher und Installation als Komplettpaket.
   */
  investment: number;

  // ---- Speicher (nur als Parameter für Autarkie-Modellierung) ----
  /** Batteriespeicher-Kapazität in kWh (0 = ohne Speicher) */
  storageKwh: number;

  // ---- Verbrauch ----
  /** Jahresstromverbrauch in kWh (Haushalt ohne WP) */
  consumption: number;
  /** Anteil des Verbrauchs, der durch PV gedeckt wird (0..1) */
  autarchyRate: number;

  // ---- Preise & Tarife ----
  /** Strompreis Jahr 1 in €/kWh */
  electricityPrice: number;
  /** Einspeisetarif (OeMAG/Marktpreis) in €/kWh */
  feedInTariff: number;
  /** jährliche Strompreissteigerung (0..1) */
  priceIncrease: number;
  /** jährliche PV-Degradation (0..1) */
  degradation: number;
  /** Betrachtungszeitraum in Jahren */
  years: number;

  // ---- Energiemanagement (Optima) ----
  emsEnabled: boolean;
  /** Autarkie-Bonus durch EMS (Prozentpunkte, 0..0.3) */
  emsAutarchyBonus: number;
  /** EMS-Investitionskosten in € */
  emsCost: number;

  // ---- Energiegemeinschaft ----
  /** Anteil der Einspeisung, der an die EG verkauft wird (0..1) */
  egSellShare: number;
  /** EG-Verkaufstarif Jahr 1 in €/kWh */
  egSellPrice: number;
  /** jährliche Steigerung des EG-Verkaufstarifs (0..1) */
  egSellPriceIncrease: number;
  /** Anteil des Netzbezugs, der aus der EG gekauft wird (0..1) */
  egBuyShare: number;
  /** EG-Kaufpreis Jahr 1 in €/kWh */
  egBuyPrice: number;
  /** jährliche Steigerung des EG-Kaufpreises (0..1) */
  egBuyPriceIncrease: number;

  // ---- Wärmepumpe ----
  wpEnabled: boolean;
  /** Jahresbrennstoffbedarf der alten Heizung in kWh (Wert von der alten Rechnung) */
  oldFuelDemand: number;
  /** Wirkungsgrad der alten Heizung (0..1, z.B. 0.9 bei Gas) */
  oldHeatingEfficiency: number;
  /** SCOP/JAZ der Wärmepumpe (typ. 3,5–4,5 Luft / 4–5 Sole) */
  wpScop: number;
  /** WP-Investition (netto, nach Förderung) in € */
  wpInvestment: number;
  /** Wartungskosten WP €/Jahr */
  wpMaintenanceCost: number;

  // ---- Alte Heizung (Brennstoffpreis-Daten) ----
  oldFuelType: FuelType;
  /** Brennstoffpreis Jahr 1 in €/kWh */
  oldFuelPricePerKwh: number;
  /** jährliche Brennstoffpreis-Steigerung (0..1) */
  oldFuelPriceIncrease: number;
  /** Wartungskosten alte Heizung €/Jahr */
  oldMaintenanceCost: number;
}

export interface YearRow {
  year: number;
  electricityPrice: number;   // €/kWh
  pvProduction: number;       // kWh
  selfConsumption: number;    // kWh
  gridConsumption: number;    // kWh
  feedIn: number;             // kWh
  egBoughtKwh: number;        // kWh aus EG bezogen
  egSoldKwh: number;          // kWh an EG verkauft
  /** Status-quo-Kosten (€/Jahr): Haushaltsstrom + ggf. alte Heizung */
  costWithoutPv: number;
  /** Neue Kosten (€/Jahr): nach PV/WP/EG/EMS */
  costWithPv: number;
  /** Ersparnis pro Jahr in € */
  savings: number;
  /** kumulierte Ersparnis in € */
  cumulativeSavings: number;
  /** Netto-Cashflow: kumulierte Ersparnis − Gesamt-Investition */
  netCashflow: number;
}

export interface PvResult {
  rows: YearRow[];
  /** Gesamt-Investition = PV + EMS + WP (€) */
  totalInvestment: number;
  totalSavings: number;
  amortizationYear: number | null;
  amortizationFraction: number | null;
  totalProduction: number;
  totalSelfConsumption: number;
  totalFeedIn: number;
  averageAutarchy: number;
  /** Gesamtersparnis / Gesamt-Investition (z.B. 1,4 = 140 %) */
  roi: number;
  /** Strombedarf der WP pro Jahr in kWh (0 wenn WP aus) */
  wpElectricity: number;
  /** Tatsächlicher Wärmebedarf des Hauses in kWh = oldFuelDemand × η */
  wpHeatDemand: number;
}
