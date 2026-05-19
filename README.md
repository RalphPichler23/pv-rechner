# Heizma · PV-Rechner

Interner PV-Amortisationsrechner für Beratungsgespräche.
React + TypeScript + Vite + Tailwind CSS v4.

## Loslegen

```bash
npm install
npm run dev      # Dev-Server (mit HMR)
npm run build    # Production-Build (./dist)
npm run preview  # baut + serviert den Production-Build lokal
npm run lint
```

## Was der Rechner kann

- Live-Berechnung über 1–40 Jahre
- Eingaben: Anlagengröße (kWp), spez. Ertrag, **PV-Investition**, Verbrauch,
  Eigendeckungsgrad, **Batteriespeicher (kWh + Kosten)**, Strompreis,
  Einspeisetarif, Strompreissteigerung, PV-Degradation
- **Auto-Autarkie**: Speichergröße → empfohlene Autarkie (HTW-Berlin-Approximation),
  manuell überschreibbar
- **Gesamt-Investition** = PV + Speicher, fließt direkt in Amortisation
- KPIs: Ersparnis Jahr 1, Kumuliert, Amortisationsjahr, Netto-Gewinn / ROI
- Cashflow-Chart mit Break-Even-Markierung
- Detailtabelle Jahr-für-Jahr
- **PDF-Export** via Druck-Dialog (A4-optimiertes Print-Stylesheet, Heizma-Header
  und kompakter Parameter-Strip nur im Druck)
- **Energiemanagement (Optima)** – Toggle, Autarkie-Bonus (PP) und eigene
  Investition werden zur Gesamt-Investition addiert
- **Energiegemeinschaft** – Anteile + Tarife + Steigerungen getrennt für
  Verkauf (Default 8,4 ct/kWh) und Bezug (Default 10,9 ct/kWh); Rest läuft
  weiterhin regulär über OeMAG/Versorger
- **Wärmepumpe** – Brennstoff-Preset (Gas/Öl/Pellets/Holz/Kohle/Strom-Direkt)
  inkl. Wirkungsgrad-Faktor der alten Anlage. Formel:
  `Stromkosten WP = (Brennstoff × η_alt / SCOP) × Strompreis`. Damit auf den
  Euro genau zu Heizma's eigener Beispielrechnung "Familie Huber" (855 €/J).
- **Tabs**: **Nur PV** / **Nur WP** / **WP + PV** – beim Tab-Wechsel werden
  irrelevante Felder ausgeblendet, Defaults sinnvoll gesetzt.

## Modell (in `src/lib/pv.ts`)

```
PV_Prod(y)        = kWp · spez_Ertrag · (1 − degradation)^(y−1)
Strompreis(y)     = Preis₀ · (1 + Steigerung)^(y−1)
Eigenverbrauch(y) = Verbrauch · Quote · (1 − degradation)^(y−1)
Netzbezug(y)      = Verbrauch − Eigenverbrauch(y)
Einspeisung(y)    = PV_Prod(y) − Eigenverbrauch(y)
Kosten ohne PV(y) = Verbrauch · Strompreis(y)
Kosten mit PV(y)  = Netzbezug(y) · Strompreis(y) − Einspeisung(y) · Einspeisetarif
Ersparnis(y)      = Kosten ohne PV(y) − Kosten mit PV(y)
Amortisation      = erstes Jahr mit Σ Ersparnis ≥ Investition
```

Die Logik reproduziert die Vorlagen-Tabelle exakt (Jahr 1: 2.373 €,
Jahr 10 kumuliert: 27.816 €).

## Projektstruktur

```
src/
  App.tsx                                      ← App-Shell
  main.tsx                                     ← Entry
  index.css                                    ← Tailwind v4 + Heizma-Tokens + Print-CSS

  lib/calc/                                    ← Reine Domain-Logik (keine UI)
    types.ts                                     PvInputs, YearRow, PvResult, TabMode, FuelType
    defaults.ts                                  DEFAULT_INPUTS + presetForTab()
    fuels.ts                                     FUEL_PRESETS für Gas/Öl/Pellets/Holz/Kohle/Strom
    autarchy.ts                                  recommendedAutarchy() (HTW-Berlin-Approx)
    calculate.ts                                 Hauptberechnung
    format.ts                                    Intl-Number-Formatter (de-AT)
    index.ts                                     Re-Exports

  components/
    Header.tsx                                   App-Header

  modules/calculator/                          ← UI-Module
    PvCalculator.tsx                             Orchestrator (~75 Z.)
    index.ts
    components/
      Tabs.tsx                                   Tab-Switch (PV / WP / WP+PV)
      Toolbar.tsx                                Header + PDF-Export-Button
      Fieldset.tsx                               Generischer Section-Wrapper
      NumberInput.tsx                            Numerischer Input mit Komma-Support
    inputs/
      InputsPanel.tsx                            Orchestriert die Sections je nach Tab
      PvInputSection.tsx                         Anlage + Speicher + PV-Investition
      ConsumptionSection.tsx                     Verbrauch + Auto-Autarkie
      EmsSection.tsx                             Optima EMS
      EnergyCommunitySection.tsx                 EG-Verkauf + EG-Bezug (8,4 / 10,9 ct)
      HeatPumpSection.tsx                        WP + Brennstoff-Preset (Gas/Öl/…)
      PricingSection.tsx                         Strompreis, Einspeise, Steigerung, Degradation
      types.ts                                   Setter-Helper
    results/
      ResultsPanel.tsx                           Orchestriert die Result-Blocks
      KpiCards.tsx                               4 KPI-Karten
      CashflowChart.tsx                          SVG-Cashflow-Chart
      SummaryStats.tsx                           Energiebilanz
      ResultTable.tsx                            Jahres-für-Jahr-Tabelle
    print/
      PrintHeader.tsx                            Druck-Header (Heizma-Logo, Datum)
      PrintParameterStrip.tsx                    Parameter-Übersicht für PDF
```

**Größen:** kein File über 210 Zeilen, der Hauptkalkulator ist 76 Zeilen.

## Branding

Markenfarben sind als Tailwind-Tokens in `src/index.css` als `@theme` definiert,
also überall als `bg-heizma-orange`, `text-heizma-ink`, … verfügbar.
Falls die exakten Hex-Werte aus dem Style-Guide abweichen, einfach dort anpassen.
