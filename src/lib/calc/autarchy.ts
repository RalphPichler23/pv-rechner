/**
 * Empfohlene Autarkiequote als Funktion von Verbrauch, Speichergröße,
 * Zusatzverbrauchern und PV-Produktion.
 *
 * Approximation der HTW-Berlin „Stromspeicher-Inspektor"-Realdaten:
 * - 0 kWh Speicher:  ~30 %  (reiner Direkt-Eigenverbrauch tagsüber)
 * - 5 kWh Speicher:  ~55 %
 * - 10 kWh Speicher: ~70 %  (Ø HTW Berlin)
 * - 15 kWh Speicher: ~78 %
 * - Sättigung bei ~85-90 %
 *
 * Synergie-Faktoren relativ zu Haushaltsstrom = 1,0:
 *  Wärmepumpe        0,40   Winter-Last, PV liefert dort 5-15 %
 *  Bestehende WP     0,40   (gleicher Lastgang)
 *  Pool              1,00   Sommer-Last, perfekt zur PV-Spitze
 *  Klimaanlage       1,00   Sommer-Mittag, perfekt zur PV-Spitze
 *  E-Auto            0,80   ganzjährig + Überschuss-Laden möglich
 *  Sauna             0,60   überwiegend abends / Wochenende
 *  Whirlpool         0,60   ganzjährig beheizt (auch nachts)
 */
export interface ExtraConsumers {
  /** WP-Strombedarf aus dem Heizungstausch-Modul */
  heatPump?: number;
  /** Bestehende WP (bereits vorhandener Verbraucher) */
  existingHeatPump?: number;
  ev?: number;
  pool?: number;
  sauna?: number;
  whirlpool?: number;
  airConditioning?: number;
}

export const SYNERGY = {
  household: 1.0,
  heatPump: 0.4,
  existingHeatPump: 0.4,
  ev: 0.8,
  pool: 1.0,
  sauna: 0.6,
  whirlpool: 0.6,
  airConditioning: 1.0,
} as const;

export function recommendedAutarchy(
  consumptionKwhPerYear: number,
  storageKwh: number,
  wpElectricityKwhPerYear = 0,
  pvProductionKwhPerYear = Infinity,
  evKwhPerYear = 0,
  existingWpKwhPerYear = 0,
  poolKwh = 0,
  saunaKwh = 0,
  whirlpoolKwh = 0,
  acKwh = 0,
): number {
  const totalConsumption =
    consumptionKwhPerYear +
    wpElectricityKwhPerYear +
    evKwhPerYear +
    existingWpKwhPerYear +
    poolKwh +
    saunaKwh +
    whirlpoolKwh +
    acKwh;

  if (totalConsumption <= 0) return 0.3;

  // HTW-Approximation für Haushalts-Autarkie (Speicher relativ zum
  // Gesamtbedarf — größerer Verbrauch braucht relativ mehr Speicher).
  const daily = totalConsumption / 365;
  const ratio = daily > 0 ? Math.max(0, storageKwh) / daily : 0;
  const direct = 0.3;
  const stored = 0.6 * (1 - Math.exp(-1.5 * ratio));
  const householdAutarchy = Math.max(0.05, Math.min(0.9, direct + stored));

  // Gewichteter Mittelwert über die Verbraucher mit Synergie-Faktoren
  const weighted =
    consumptionKwhPerYear * householdAutarchy * SYNERGY.household +
    wpElectricityKwhPerYear * householdAutarchy * SYNERGY.heatPump +
    existingWpKwhPerYear * householdAutarchy * SYNERGY.existingHeatPump +
    evKwhPerYear * householdAutarchy * SYNERGY.ev +
    poolKwh * householdAutarchy * SYNERGY.pool +
    saunaKwh * householdAutarchy * SYNERGY.sauna +
    whirlpoolKwh * householdAutarchy * SYNERGY.whirlpool +
    acKwh * householdAutarchy * SYNERGY.airConditioning;
  let suggestion = weighted / totalConsumption;

  // Cap am physikalischen Maximum (PV-Produktion / Gesamtbedarf × 0,95).
  if (pvProductionKwhPerYear > 0 && Number.isFinite(pvProductionKwhPerYear)) {
    const physicalMax = (pvProductionKwhPerYear * 0.95) / totalConsumption;
    suggestion = Math.min(suggestion, physicalMax);
  }

  return Math.max(0.05, Math.min(0.95, suggestion));
}
