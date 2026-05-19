import type { FuelType } from "./types";

/**
 * Default-Brennstoffpreise und typische Anlagenwirkungsgrade AT 2026.
 * Quellen: e-control (Gas), tecson.de (Öl), propellets.at (Pellets).
 */
export interface FuelPreset {
  label: string;
  /** €/kWh (Brutto-Mittelwerte AT 2026) */
  price: number;
  /** jährliche Preissteigerung (Faustwerte) */
  increase: number;
  /** typischer Anlagenwirkungsgrad (alt) */
  efficiency: number;
}

export const FUEL_PRESETS: Record<FuelType, FuelPreset> = {
  gas:      { label: "Erdgas",               price: 0.10,  increase: 0.05, efficiency: 0.90 },
  oil:      { label: "Heizöl",               price: 0.177, increase: 0.04, efficiency: 0.85 },
  pellets:  { label: "Pellets",              price: 0.082, increase: 0.03, efficiency: 0.85 },
  wood:     { label: "Stückholz / Scheitholz", price: 0.06, increase: 0.03, efficiency: 0.75 },
  coal:     { label: "Kohle",                price: 0.08,  increase: 0.04, efficiency: 0.70 },
  electric: { label: "Strom-Direktheizung",  price: 0.21,  increase: 0.05, efficiency: 1.00 },
  other:    { label: "Sonstige",             price: 0.10,  increase: 0.05, efficiency: 0.90 },
};
