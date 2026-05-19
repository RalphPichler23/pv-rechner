/**
 * Berechnungslogik des Heizma PV-Amortisationsrechners.
 *
 * Modell (an die Vorlage angelehnt):
 *  - PV-Produktion Jahr 1: kwp * spezifischerErtrag (kWh/kWp)
 *  - Eigenverbrauch Jahr 1: jahresverbrauch * autarkiequote
 *    (Anteil des Verbrauchs, der durch PV gedeckt wird)
 *  - Ab Jahr 2:
 *      Strompreis steigt jährlich um `strompreisSteigerung` (z. B. 5 %)
 *      PV-Produktion sinkt jährlich um `degradation` (z. B. 0,5 %)
 *      Eigenverbrauch skaliert proportional zur (sinkenden) PV-Produktion
 *  - Netzbezug    = Jahresverbrauch − Eigenverbrauch
 *  - Einspeisung  = PV-Produktion − Eigenverbrauch
 *  - Kosten ohne PV = Jahresverbrauch * Strompreis
 *  - Kosten mit PV  = Netzbezug * Strompreis − Einspeisung * Einspeisetarif
 *  - Ersparnis Jahr = Kosten ohne PV − Kosten mit PV
 *  - Kumuliert      = Σ Ersparnis
 *  - Amortisation   = Jahr, in dem Kumulierte Ersparnis ≥ Investition
 */

export interface PvInputs {
  /** Anlagengröße in kWp */
  kwp: number;
  /** spezifischer Jahresertrag in kWh pro kWp (typ. AT: 950–1150) */
  yieldPerKwp: number;
  /** Jahresstromverbrauch in kWh */
  consumption: number;
  /** Anteil des Verbrauchs, der durch PV gedeckt wird (0..1) */
  autarchyRate: number;
  /** Strompreis Jahr 1 in €/kWh */
  electricityPrice: number;
  /** Einspeisetarif in €/kWh (typisch fix) */
  feedInTariff: number;
  /** jährliche Strompreissteigerung (0..1) */
  priceIncrease: number;
  /** jährliche PV-Degradation (0..1) */
  degradation: number;
  /** Betrachtungszeitraum in Jahren */
  years: number;
  /** Investitionssumme (netto, nach Förderung) in € */
  investment: number;
}

export interface YearRow {
  year: number;
  electricityPrice: number;   // €/kWh
  pvProduction: number;       // kWh
  selfConsumption: number;    // kWh
  gridConsumption: number;    // kWh
  feedIn: number;             // kWh
  costWithoutPv: number;      // €
  costWithPv: number;         // €
  savings: number;            // €
  cumulativeSavings: number;  // €
  netCashflow: number;        // € (kumulierte Ersparnis - Investition)
}

export interface PvResult {
  rows: YearRow[];
  totalSavings: number;
  amortizationYear: number | null;
  amortizationFraction: number | null; // exakter Bruchteil des Jahres
  totalProduction: number;
  totalSelfConsumption: number;
  totalFeedIn: number;
  averageAutarchy: number;
  roi: number; // Gesamtersparnis / Investition (z.B. 1.4 = 140 %)
}

export function calculate(input: PvInputs): PvResult {
  const rows: YearRow[] = [];

  const annualProductionY1 = input.kwp * input.yieldPerKwp;
  const annualSelfY1 = input.consumption * input.autarchyRate;

  let cumulative = 0;
  let totalProduction = 0;
  let totalSelf = 0;
  let totalFeed = 0;

  let amortizationYear: number | null = null;
  let amortizationFraction: number | null = null;

  for (let i = 0; i < input.years; i++) {
    const yearNumber = i + 1;
    const priceFactor = Math.pow(1 + input.priceIncrease, i);
    const degradationFactor = Math.pow(1 - input.degradation, i);

    const price = input.electricityPrice * priceFactor;
    const pvProduction = annualProductionY1 * degradationFactor;
    // Eigenverbrauch skaliert mit der (sinkenden) PV-Produktion,
    // aber nie mehr als der Jahresverbrauch.
    const selfConsumption = Math.min(
      annualSelfY1 * degradationFactor,
      input.consumption,
    );
    const gridConsumption = Math.max(0, input.consumption - selfConsumption);
    const feedIn = Math.max(0, pvProduction - selfConsumption);

    const costWithoutPv = input.consumption * price;
    const costWithPv = gridConsumption * price - feedIn * input.feedInTariff;
    const savings = costWithoutPv - costWithPv;

    const previousCumulative = cumulative;
    cumulative += savings;
    const netCashflow = cumulative - input.investment;

    if (amortizationYear === null && cumulative >= input.investment) {
      amortizationYear = yearNumber;
      // exakter Bruchteil: wie viel des Jahres bis Break-Even
      const remaining = input.investment - previousCumulative;
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
      costWithoutPv,
      costWithPv,
      savings,
      cumulativeSavings: cumulative,
      netCashflow,
    });
  }

  const totalSavings = cumulative;
  const averageAutarchy =
    input.consumption > 0
      ? totalSelf / (input.consumption * input.years)
      : 0;
  const roi = input.investment > 0 ? totalSavings / input.investment : 0;

  return {
    rows,
    totalSavings,
    amortizationYear,
    amortizationFraction,
    totalProduction,
    totalSelfConsumption: totalSelf,
    totalFeedIn: totalFeed,
    averageAutarchy,
    roi,
  };
}

// ---------- Formatter ----------

const eur = new Intl.NumberFormat("de-AT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const eur2 = new Intl.NumberFormat("de-AT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const intFmt = new Intl.NumberFormat("de-AT", { maximumFractionDigits: 0 });

const dec2 = new Intl.NumberFormat("de-AT", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const pct1 = new Intl.NumberFormat("de-AT", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const fmt = {
  eur: (n: number) => eur.format(Math.round(n)),
  eur2: (n: number) => eur2.format(n),
  int: (n: number) => intFmt.format(Math.round(n)),
  /** für ct/kWh aus €/kWh */
  cents: (n: number) => dec2.format(n * 100),
  pct: (n: number) => pct1.format(n),
};
