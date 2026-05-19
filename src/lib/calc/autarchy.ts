/**
 * Empfohlene Autarkiequote als Funktion von Jahresverbrauch und Speichergröße.
 *
 * Approximation der HTW-Berlin „Stromspeicher-Inspektor"-Realdaten:
 * - 0 kWh Speicher:  ~30 %
 * - 5 kWh Speicher:  ~55 %
 * - 10 kWh Speicher: ~70 %
 * - 15 kWh Speicher: ~78 %
 * - Sättigung bei ~85-90 %
 *
 * Mit Wärmepumpe wird die effektive Autarkie geringer, weil die WP überwiegend
 * im Winter läuft (wenig PV-Ertrag). Faktor ~0,4 vs. Haushaltsstrom.
 */
export function recommendedAutarchy(
  consumptionKwhPerYear: number,
  storageKwh: number,
  wpElectricityKwhPerYear = 0,
): number {
  if (consumptionKwhPerYear <= 0) return 0.3;
  const daily = consumptionKwhPerYear / 365;
  const ratio = Math.max(0, storageKwh) / daily;
  const direct = 0.3;
  const stored = 0.6 * (1 - Math.exp(-1.5 * ratio));
  const householdAutarchy = Math.max(0.05, Math.min(0.9, direct + stored));

  if (wpElectricityKwhPerYear <= 0) return householdAutarchy;
  const wpAutarchy = householdAutarchy * 0.4;
  const total = consumptionKwhPerYear + wpElectricityKwhPerYear;
  return (
    (consumptionKwhPerYear * householdAutarchy +
      wpElectricityKwhPerYear * wpAutarchy) /
    total
  );
}
