import { FUEL_PRESETS } from "./fuels";
import type { PvInputs, TabMode } from "./types";

/**
 * Default-Werte für AT 2026.
 * Reproduziert die Heizma-Vorlage (mit wpEnabled = false): 2.373 € J1, 27.816 € kumuliert J10.
 */
export const DEFAULT_INPUTS: PvInputs = {
  // PV-Anlage (Heizma "Komplettpaket": ~24 k€ für 14 kWp inkl. Speicher)
  kwp: 14,
  yieldPerKwp: 1075,
  investment: 24000,

  // Speicher als Parameter (Heizma-Komplettpaket: ~10 kWh)
  storageKwh: 10,

  // Verbrauch
  consumption: 11000,
  autarchyRate: 0.8,

  // Preise
  electricityPrice: 0.21,
  feedInTariff: 0.084,
  priceIncrease: 0.05,
  degradation: 0.005,
  years: 20,

  // EMS (Optima)
  emsEnabled: false,
  emsAutarchyBonus: 0.1,
  emsCost: 2500,

  // Energiegemeinschaft (Defaults laut User: 8,4 ct Verkauf, 10,9 ct Bezug)
  egSellShare: 0,
  egSellPrice: 0.084,
  egSellPriceIncrease: 0,
  egBuyShare: 0,
  egBuyPrice: 0.109,
  egBuyPriceIncrease: 0.05,

  // Wärmepumpe (Heizma Beispiel "Familie Huber")
  wpEnabled: false,
  oldFuelDemand: 15000,
  oldHeatingEfficiency: FUEL_PRESETS.gas.efficiency, // 0.9
  wpScop: 4.0,
  wpInvestment: 12500,
  wpMaintenanceCost: 200,

  // Alte Heizung
  oldFuelType: "gas",
  oldFuelPricePerKwh: FUEL_PRESETS.gas.price,
  oldFuelPriceIncrease: FUEL_PRESETS.gas.increase,
  oldMaintenanceCost: 200,
};

/**
 * Defaults beim Tab-Wechsel: stellt sicher, dass irrelevante Module aus sind.
 */
export function presetForTab(prev: PvInputs, mode: TabMode): PvInputs {
  switch (mode) {
    case "pv":
      return { ...prev, wpEnabled: false };
    case "wp":
      return { ...prev, kwp: 0, investment: 0, wpEnabled: true };
    case "combined":
      return { ...prev, wpEnabled: true, kwp: prev.kwp || 14, investment: prev.investment || 24000 };
  }
}
