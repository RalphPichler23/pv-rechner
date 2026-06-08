import { FUEL_PRESETS } from "./fuels";
import type { PvInputs, TabMode } from "./types";

/**
 * Default-Werte für AT 2026.
 * Reproduziert die Heizma-Vorlage (mit wpEnabled = false): 2.373 € J1, 27.816 € kumuliert J10.
 */
export const DEFAULT_INPUTS: PvInputs = {
  // PV-Anlage (Heizma "Komplettpaket": ~18 k€ für 10 kWp inkl. Speicher)
  kwp: 10,
  yieldPerKwp: 1075,
  investment: 18000,

  // Speicher als Parameter (Heizma-Komplettpaket: ~10 kWh)
  storageKwh: 10,

  // Verbrauch (typischer EFH mit WP-Vorbereitung)
  consumption: 4500,
  autarchyRate: 0.7,

  // Preise
  electricityPrice: 0.21,
  feedInTariff: 0.06,
  priceIncrease: 0.05,
  degradation: 0.005,
  years: 25,

  // EMS (Optima) – Heizma-Preis 866 €
  // Default 10 PP konservativ (HTW Berlin Stromspeicher-Inspektion 2024:
  // EMS-Steuerung bringt +5-10 PP über reinem Speicher). Heizma wirbt mit
  // "bis 30%" — das ist die theoretische Obergrenze für Top-Setups.
  // Wenn der User wpEmsIntegrated aktiviert, kommt für WP-Anteil zusätzlich
  // ein Bonus dazu (Faktor 0,6 → 0,8).
  emsEnabled: true,
  emsAutarchyBonus: 0.10,
  emsCost: 866,

  // Dynamische Stromtarife (aWattar Hourly etc.) — standardmäßig aktiv,
  // weil mit EMS sinnvoll. Realistisch ca. 10 % Rabatt auf Netzbezug.
  dynamicTariffEnabled: true,
  dynamicTariffDiscount: 0.1,

  // Energiegemeinschaft (Defaults laut User: 8,4 ct Verkauf, 10,9 ct Bezug)
  egSellShare: 0,
  egSellPrice: 0.084,
  egSellPriceIncrease: 0,
  egBuyShare: 0,
  egBuyPrice: 0.109,
  egBuyPriceIncrease: 0.05,

  // Wärmepumpe (Heizma Beispiel "Familie Huber")
  wpEnabled: false,
  wpEmsIntegrated: false, // standardmäßig nicht integrierbar (User aktiv)
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

  // Bestehende PV (nur WP-Tab)
  existingPvEnabled: false,

  // Zusatzverbraucher (bestehende Geräte)
  existingWpEnabled: false,
  existingWpKwhPerYear: 4000, // typ. 16.000 kWh Wärme / JAZ 4
  evEnabled: false,
  evKwhPerYear: 3000,         // 12.000 km × 18 kWh/100km × 1,1 Ladeverlust
  poolEnabled: false,
  poolKwhPerYear: 2500,       // Filterpumpe Saison + leichte Heizung
  saunaEnabled: false,
  saunaKwhPerYear: 1500,      // 6-8 kW Ofen, 1-3× Woche × 2-3 h
  whirlpoolEnabled: false,
  whirlpoolKwhPerYear: 3000,  // ganzjährig auf ~37 °C beheizt
  acEnabled: false,
  acKwhPerYear: 500,          // Split-Gerät EFH 500 h/J Betrieb (klimavergleich.at)
};

/**
 * Defaults beim Tab-Wechsel: stellt sicher, dass irrelevante Module aus sind.
 */
export function presetForTab(prev: PvInputs, mode: TabMode): PvInputs {
  switch (mode) {
    case "pv":
      return { ...prev, wpEnabled: false, existingPvEnabled: false };
    case "wp":
      return {
        ...prev,
        wpEnabled: true,
        // Beim Wechsel zu wp: PV defaultmäßig aus.
        // Wenn der User "bestehende PV" ankreuzt, werden kwp etc. wieder aktiviert.
        kwp: prev.existingPvEnabled ? prev.kwp : 0,
        investment: 0,
      };
    case "combined":
      return {
        ...prev,
        wpEnabled: true,
        kwp: prev.kwp || 10,
        investment: prev.investment || 18000,
        existingPvEnabled: false,
        wpEmsIntegrated: true, // Heizma-Komplettpaket: WP + EMS integriert
      };
  }
}
