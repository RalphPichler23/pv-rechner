/**
 * Number formatter (de-AT) für €, kWh, ct/kWh und Prozentwerte.
 */

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
  /** ct/kWh aus €/kWh */
  cents: (n: number) => dec2.format(n * 100),
  pct: (n: number) => pct1.format(n),
};
