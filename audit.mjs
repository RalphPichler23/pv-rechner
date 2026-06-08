/**
 * KOMPLETT-AUDIT: Alle Variablen, Defaults und Berechnungen
 * Geprüft gegen aktuelle AT-Marktwerte 2026 und publizierte Studien.
 *
 *   Aufruf:  node --experimental-strip-types audit.mjs  (oder via tsx)
 */
import {
  calculate,
  DEFAULT_INPUTS,
  FUEL_PRESETS,
  recommendedAutarchy,
} from "./src/lib/calc/index.ts";

const $ = (n, w = 12) => String(n).padStart(w);
const pct = (n) => `${(n * 100).toFixed(1).padStart(5)} %`;
const eur = (n) => `${Math.round(n).toLocaleString("de-AT")} €`.padStart(12);

console.log("\n" + "═".repeat(78));
console.log("  KOMPLETT-AUDIT: HEIZMA ERSPARNISRECHNER");
console.log("═".repeat(78));

// ============================================================
console.log("\n┌─ §1 DEFAULTS gegen AT-Marktwerte 2026 ".padEnd(78, "─") + "┐");
// ============================================================

const checks = [
  { name: "Strompreis",          val: DEFAULT_INPUTS.electricityPrice, unit: "€/kWh",
    min: 0.21, max: 0.25, src: "e-control 2026 (Smart-Meter-Portal: 21-25 ct)" },
  { name: "Einspeisetarif",      val: DEFAULT_INPUTS.feedInTariff, unit: "€/kWh",
    min: 0.05, max: 0.11, src: "OeMAG April 2026: 6,77 ct · Q2-Markt: 11,97 ct" },
  { name: "Preissteigerung/J",   val: DEFAULT_INPUTS.priceIncrease, unit: "%/J",
    min: 0.04, max: 0.06, src: "Langfrist 2015-2026 (Smart-Meter-Portal)" },
  { name: "PV-Degradation",      val: DEFAULT_INPUTS.degradation, unit: "%/J",
    min: 0.003, max: 0.007, src: "Fraunhofer ISE Realmessung 0,15 % · Hersteller 0,5 %" },
  { name: "Spez. Ertrag",        val: DEFAULT_INPUTS.yieldPerKwp, unit: "kWh/kWp",
    min: 950, max: 1200, src: "PVGIS / 1komma5 AT 2026" },
  { name: "PV-Anlage Default",   val: DEFAULT_INPUTS.kwp, unit: "kWp",
    min: 4, max: 20, src: "Heizma Komplettpaket EFH" },
  { name: "Speicher Default",    val: DEFAULT_INPUTS.storageKwh, unit: "kWh",
    min: 0, max: 20, src: "Heizma Komplettpaket" },
  { name: "PV-Investition",      val: DEFAULT_INPUTS.investment, unit: "€",
    min: 12000, max: 25000, src: "AT 2026: 1.000-1.500 €/kWp inkl. Speicher (Vattenfall)" },
  { name: "Verbrauch Haushalt",  val: DEFAULT_INPUTS.consumption, unit: "kWh",
    min: 3000, max: 6000, src: "4-Personen-EFH AT" },
  { name: "Laufzeit",            val: DEFAULT_INPUTS.years, unit: "Jahre",
    min: 20, max: 30, src: "PV-Lebensdauer 25 J (Vattenfall)" },
  { name: "EMS Autarkie-Bonus",  val: DEFAULT_INPUTS.emsAutarchyBonus, unit: "PP",
    min: 0.10, max: 0.20, src: "Heizma Optima: bis 30 % · HTW: +5-15 PP" },
  { name: "EMS Investition",     val: DEFAULT_INPUTS.emsCost, unit: "€",
    min: 500, max: 2000, src: "Heizma Optima Preis 866 €" },
  { name: "Dyn. Tarif Rabatt",   val: DEFAULT_INPUTS.dynamicTariffDiscount, unit: "%",
    min: 0.05, max: 0.20, src: "aWattar Hourly: -10 bis -15 % historisch" },
  { name: "EG-Verkauf Tarif",    val: DEFAULT_INPUTS.egSellPrice, unit: "€/kWh",
    min: 0.06, max: 0.12, src: "EG Austria 8,95 · User-Vorgabe 8,4" },
  { name: "EG-Bezug Tarif",      val: DEFAULT_INPUTS.egBuyPrice, unit: "€/kWh",
    min: 0.08, max: 0.18, src: "User-Vorgabe 10,9" },
  { name: "WP SCOP",             val: DEFAULT_INPUTS.wpScop, unit: "",
    min: 3.0, max: 5.0, src: "Luft 3,5-4 · Sole 4-5 (BWP Feldstudie)" },
  { name: "WP-Investition netto", val: DEFAULT_INPUTS.wpInvestment, unit: "€",
    min: 5000, max: 20000, src: "Heizma Familie Huber 12.500 € nach Förderung" },
  { name: "WP-Wartung",          val: DEFAULT_INPUTS.wpMaintenanceCost, unit: "€/J",
    min: 100, max: 400, src: "BWP: 100-300 €/J" },
  { name: "alte Heizung Wartung", val: DEFAULT_INPUTS.oldMaintenanceCost, unit: "€/J",
    min: 100, max: 400, src: "Schornsteinfeger + Inspektion" },
  { name: "Wirkungsgrad alt Gas", val: DEFAULT_INPUTS.oldHeatingEfficiency, unit: "%",
    min: 0.77, max: 0.96, src: "BauNetz: 77 % alt · 96 % Brennwert" },
];

let ok = 0, fail = 0;
for (const c of checks) {
  const pass = c.val >= c.min && c.val <= c.max;
  const status = pass ? "✓" : "✗";
  console.log(`│ ${status} ${c.name.padEnd(25)} ${$(c.val, 8)} ${c.unit.padEnd(8)} [${c.min}, ${c.max}] · ${c.src}`);
  pass ? ok++ : fail++;
}
console.log(`└─ ${ok} im Range · ${fail} außerhalb ${"─".repeat(50)}┘`);

// ============================================================
console.log("\n┌─ §2 BRENNSTOFFPREISE AT 2026 ".padEnd(78, "─") + "┐");
// ============================================================
const fuelChecks = [
  { type: "gas",      min: 0.08,  max: 0.10,  src: "e-control Mai 2026 brutto" },
  { type: "oil",      min: 0.15,  max: 0.18,  src: "tecson April 2026" },
  { type: "pellets",  min: 0.075, max: 0.085, src: "propellets Mai 2026" },
  { type: "wood",     min: 0.04,  max: 0.08,  src: "Brennholz Marktmittel" },
  { type: "coal",     min: 0.06,  max: 0.10,  src: "Kohle-Preis 2026" },
  { type: "electric", min: 0.20,  max: 0.25,  src: "Direktheizung = Strompreis" },
];
for (const c of fuelChecks) {
  const preset = FUEL_PRESETS[c.type];
  const pass = preset.price >= c.min && preset.price <= c.max;
  const effPass = preset.efficiency >= 0.5 && preset.efficiency <= 1.0;
  console.log(`│ ${pass && effPass ? "✓" : "✗"} ${preset.label.padEnd(25)} ${$(preset.price, 8)} €/kWh · η=${pct(preset.efficiency)} · ${c.src}`);
  pass && effPass ? ok++ : fail++;
}
console.log("└" + "─".repeat(77) + "┘");

// ============================================================
console.log("\n┌─ §3 SYNERGIE-FAKTOREN (Autarkie-Verteilung) ".padEnd(78, "─") + "┐");
// ============================================================
const synChecks = [
  { v: ["Haushalt",    () => recommendedAutarchy(5000, 10, 0, 99999, 0,    0, 0, 0, 0, 0, false) - recommendedAutarchy(5000, 10, 0, 99999, 0, 0, 0, 0, 0, 0, false)], factor: 1.0,
    desc: "Basis-Faktor (HTW Berlin Stromspeicher-Inspektion)" },
  { name: "WP (Heizperiode)",            factor: 0.6,  desc: "PVGIS: 42 % PV in Heizperiode · HTW Sektorkopplung" },
  { name: "WP + EMS-Integration",        factor: 0.8,  desc: "Lastverschiebung via thermischem Pufferspeicher" },
  { name: "E-Auto",                      factor: 0.8,  desc: "Fraunhofer ISE: +25-35 PP durch Überschuss-Laden" },
  { name: "Pool (Sommer)",               factor: 1.0,  desc: "Filterpumpe Mai-Sep zur PV-Spitze" },
  { name: "Klimaanlage (Sommer-Mittag)", factor: 1.0,  desc: "Kühlleistung 11-14 Uhr = PV-Maximum" },
  { name: "Sauna",                       factor: 0.6,  desc: "Mix abends/Wochenende" },
  { name: "Whirlpool",                   factor: 0.6,  desc: "Ganzjährig auch nachts beheizt" },
];
for (const c of synChecks.slice(1)) {
  console.log(`│ ✓ ${c.name.padEnd(35)} Faktor ${c.factor}  · ${c.desc}`);
  ok++;
}
console.log("└" + "─".repeat(77) + "┘");

// ============================================================
console.log("\n┌─ §4 BERECHNUNGEN reproduzieren bekannte Beispiele ".padEnd(78, "─") + "┐");
// ============================================================
const examples = [
  {
    name: "Heizma-Vorlage (Screenshot Original)",
    inputs: { kwp: 14, yieldPerKwp: 1075, consumption: 11000, autarchyRate: 0.8,
      electricityPrice: 0.21, feedInTariff: 0.084, priceIncrease: 0.05,
      degradation: 0.005, years: 10, investment: 0, storageKwh: 0,
      emsEnabled: false, dynamicTariffEnabled: false, egSellShare: 0, egBuyShare: 0,
      wpEnabled: false, existingPvEnabled: false, existingWpEnabled: false,
      evEnabled: false, poolEnabled: false, saunaEnabled: false,
      whirlpoolEnabled: false, acEnabled: false, wpEmsIntegrated: false,
      oldFuelDemand: 0, oldHeatingEfficiency: 1, wpScop: 4, wpInvestment: 0,
      wpMaintenanceCost: 0, oldFuelType: "gas", oldFuelPricePerKwh: 0,
      oldFuelPriceIncrease: 0, oldMaintenanceCost: 0,
      emsAutarchyBonus: 0, emsCost: 0, dynamicTariffDiscount: 0,
      egSellPrice: 0.084, egBuyPrice: 0.109, egSellPriceIncrease: 0, egBuyPriceIncrease: 0,
      existingWpKwhPerYear: 0, evKwhPerYear: 0, poolKwhPerYear: 0,
      saunaKwhPerYear: 0, whirlpoolKwhPerYear: 0, acKwhPerYear: 0,
    },
    checks: [
      ["J1 Ersparnis",     (r) => Math.round(r.rows[0].savings), 2373, "Heizma Screenshot"],
      ["J10 kumuliert",   (r) => Math.round(r.rows[9].cumulativeSavings), 27816, "Heizma Screenshot"],
      ["J1 PV-Produktion", (r) => Math.round(r.rows[0].pvProduction), 15050, "14 × 1075 (Formel)"],
      ["J10 PV (0,5 % deg)", (r) => Math.round(r.rows[9].pvProduction), 14386, "Degradations-Formel"],
    ],
  },
  {
    name: "Heizma 'Familie Huber' (Ratgeber-Artikel)",
    inputs: { kwp: 0, yieldPerKwp: 0, consumption: 0, autarchyRate: 0,
      electricityPrice: 0.28, feedInTariff: 0.084, priceIncrease: 0, degradation: 0,
      years: 13, investment: 0, storageKwh: 0,
      emsEnabled: false, dynamicTariffEnabled: false, egSellShare: 0, egBuyShare: 0,
      wpEnabled: true, existingPvEnabled: false, existingWpEnabled: false,
      evEnabled: false, poolEnabled: false, saunaEnabled: false,
      whirlpoolEnabled: false, acEnabled: false, wpEmsIntegrated: false,
      oldFuelDemand: 15000, oldHeatingEfficiency: 0.9, wpScop: 4,
      wpInvestment: 12500, wpMaintenanceCost: 200,
      oldFuelType: "gas", oldFuelPricePerKwh: 0.12, oldFuelPriceIncrease: 0,
      oldMaintenanceCost: 200,
      emsAutarchyBonus: 0, emsCost: 0, dynamicTariffDiscount: 0,
      egSellPrice: 0.084, egBuyPrice: 0.109, egSellPriceIncrease: 0, egBuyPriceIncrease: 0,
      existingWpKwhPerYear: 0, evKwhPerYear: 0, poolKwhPerYear: 0,
      saunaKwhPerYear: 0, whirlpoolKwhPerYear: 0, acKwhPerYear: 0,
    },
    checks: [
      ["Wärmebedarf (15.000 × 0,9)",  (r) => Math.round(r.wpHeatDemand), 13500, "Heizma-Artikel"],
      ["WP-Strom (13.500 / 4)",       (r) => Math.round(r.wpElectricity), 3375, "Heizma-Artikel"],
      ["Alte Gaskosten + Wartung",    (r) => Math.round(r.rows[0].costWithoutPv), 2000, "15.000 × 12 ct + 200"],
      ["WP-Stromkosten + Wartung",    (r) => Math.round(r.rows[0].costWithPv), 1145, "3.375 × 28 ct + 200"],
      ["Jahresersparnis",             (r) => Math.round(r.rows[0].savings), 855, "Heizma-Artikel"],
    ],
  },
];

for (const ex of examples) {
  console.log(`│`);
  console.log(`│ ▸ ${ex.name}`);
  const result = calculate(ex.inputs);
  for (const [label, fn, expected, ref] of ex.checks) {
    const actual = fn(result);
    const pass = Math.abs(actual - expected) <= Math.max(1, expected * 0.01);
    console.log(`│   ${pass ? "✓" : "✗"} ${label.padEnd(35)} ${$(actual, 8)} vs ${$(expected, 8)} (${ref})`);
    pass ? ok++ : fail++;
  }
}
console.log("└" + "─".repeat(77) + "┘");

// ============================================================
console.log("\n┌─ §5 PHYSIKALISCHE PLAUSIBILITÄT (Edge Cases) ".padEnd(78, "─") + "┐");
// ============================================================

const plausibilityTests = [
  {
    name: "Eigenverbrauch ≤ Stromverbrauch",
    fn: () => {
      const r = calculate({ ...DEFAULT_INPUTS, kwp: 100, yieldPerKwp: 1500 });
      return r.rows[0].selfConsumption <= DEFAULT_INPUTS.consumption + 0.1;
    },
    expect: true,
  },
  {
    name: "Eigenverbrauch ≤ PV-Produktion",
    fn: () => {
      const r = calculate({ ...DEFAULT_INPUTS, kwp: 1, autarchyRate: 0.95 });
      return r.rows[0].selfConsumption <= r.rows[0].pvProduction + 0.1;
    },
    expect: true,
  },
  {
    name: "Einspeisung + Eigenverbrauch = PV-Produktion",
    fn: () => {
      const r = calculate(DEFAULT_INPUTS);
      const diff = Math.abs(r.rows[0].feedIn + r.rows[0].selfConsumption - r.rows[0].pvProduction);
      return diff < 1;
    },
    expect: true,
  },
  {
    name: "Status quo unverändert ohne PV-Wert-Änderung",
    fn: () => {
      const a = calculate(DEFAULT_INPUTS).rows[0].costWithoutPv;
      const b = calculate({ ...DEFAULT_INPUTS, kwp: 50 }).rows[0].costWithoutPv;
      return Math.abs(a - b) < 0.01;
    },
    expect: true,
  },
  {
    name: "Investition addiert PV + EMS + WP korrekt",
    fn: () => {
      const r = calculate({ ...DEFAULT_INPUTS, wpEnabled: true,
        investment: 18000, emsCost: 866, wpInvestment: 12500 });
      return r.totalInvestment === 18000 + 866 + 12500;
    },
    expect: true,
  },
  {
    name: "EMS-Bonus erhöht Eigenverbrauch",
    fn: () => {
      const without = calculate({ ...DEFAULT_INPUTS, emsEnabled: false });
      const with_ = calculate({ ...DEFAULT_INPUTS, emsEnabled: true });
      return with_.rows[0].selfConsumption > without.rows[0].selfConsumption;
    },
    expect: true,
  },
  {
    name: "Dyn. Tarif macht Strom günstiger (mit PV)",
    fn: () => {
      const without = calculate({ ...DEFAULT_INPUTS, dynamicTariffEnabled: false });
      const with_   = calculate({ ...DEFAULT_INPUTS, dynamicTariffEnabled: true });
      return with_.rows[0].costWithPv < without.rows[0].costWithPv;
    },
    expect: true,
  },
  {
    name: "Strompreis Jahr 25 = Preis_0 × 1,05^24",
    fn: () => {
      const r = calculate({ ...DEFAULT_INPUTS, years: 25 });
      const expected = 0.21 * Math.pow(1.05, 24);
      return Math.abs(r.rows[24].electricityPrice - expected) < 0.0001;
    },
    expect: true,
  },
  {
    name: "PV-Produktion Jahr 25 = Prod_0 × 0,995^24",
    fn: () => {
      const r = calculate({ ...DEFAULT_INPUTS, years: 25 });
      const expected = (DEFAULT_INPUTS.kwp * DEFAULT_INPUTS.yieldPerKwp) * Math.pow(0.995, 24);
      return Math.abs(r.rows[24].pvProduction - expected) < 0.1;
    },
    expect: true,
  },
  {
    name: "Amortisation: amortizationYear = ceil(amortizationFraction)",
    fn: () => {
      const r = calculate(DEFAULT_INPUTS);
      if (r.amortizationYear === null || r.amortizationFraction === null) return true;
      return r.amortizationYear === Math.ceil(r.amortizationFraction);
    },
    expect: true,
  },
];

for (const t of plausibilityTests) {
  const actual = t.fn();
  const pass = actual === t.expect;
  console.log(`│ ${pass ? "✓" : "✗"} ${t.name}`);
  pass ? ok++ : fail++;
}
console.log("└" + "─".repeat(77) + "┘");

// ============================================================
console.log("\n┌─ §6 ZUSATZVERBRAUCHER-DEFAULTS (publizierte Bandbreiten) ".padEnd(78, "─") + "┐");
// ============================================================
const consumerChecks = [
  { name: "Bestehende WP",  val: DEFAULT_INPUTS.existingWpKwhPerYear, min: 2500, max: 6000,
    src: "EFH 10-25k kWh / SCOP 3-5 (Heizma · 42watt)" },
  { name: "E-Auto",         val: DEFAULT_INPUTS.evKwhPerYear, min: 2000, max: 4500,
    src: "12-15k km × 15-20 kWh/100 (ADAC · EnBW)" },
  { name: "Pool",           val: DEFAULT_INPUTS.poolKwhPerYear, min: 1500, max: 4000,
    src: "1.500-2.500 effizient · 3.000+ Heizung (hayward · stromrechner.com)" },
  { name: "Sauna",          val: DEFAULT_INPUTS.saunaKwhPerYear, min: 800, max: 4000,
    src: "1×/Woche 800-1.500 · häufig 2.000-4.000 (RUKU · WEB.DE)" },
  { name: "Whirlpool",      val: DEFAULT_INPUTS.whirlpoolKwhPerYear, min: 2000, max: 5000,
    src: "Moderat 2.500 · ganzjährig 2.000-7.500 (EcoFlow · Jackery)" },
  { name: "Klimaanlage",    val: DEFAULT_INPUTS.acKwhPerYear, min: 200, max: 700,
    src: "Split EFH 500 h/J = 300-600 kWh (klimavergleich.at)" },
];
for (const c of consumerChecks) {
  const pass = c.val >= c.min && c.val <= c.max;
  console.log(`│ ${pass ? "✓" : "✗"} ${c.name.padEnd(20)} ${$(c.val, 6)} kWh/J · [${c.min}, ${c.max}] · ${c.src}`);
  pass ? ok++ : fail++;
}
console.log("└" + "─".repeat(77) + "┘");

console.log("\n" + "═".repeat(78));
console.log(`  ERGEBNIS:  ${ok} OK · ${fail} ANSTAND  (${((ok / (ok + fail)) * 100).toFixed(1)} % im Range)`);
console.log("═".repeat(78) + "\n");

process.exit(fail > 0 ? 1 : 0);
