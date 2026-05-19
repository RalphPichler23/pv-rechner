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
- Eingaben: Anlagengröße (kWp), spez. Ertrag, Verbrauch,
  Eigenverbrauchsquote, Strompreis, Einspeisetarif, Strompreissteigerung,
  PV-Degradation, Investitionssumme
- KPIs: Ersparnis Jahr 1, Kumuliert, Amortisationsjahr, Netto-Gewinn / ROI
- Cashflow-Chart mit Break-Even-Markierung
- Detailtabelle Jahr-für-Jahr (Strompreis, PV-Produktion, Netzbezug,
  Einspeisung, Kosten ohne / mit PV, Ersparnis, Kumuliert, vs. Investition)

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
  App.tsx
  main.tsx
  index.css                ← Tailwind + Heizma-Tokens (@theme)
  lib/pv.ts                ← reine Berechnungslogik + Formatter
  components/
    Header.tsx
    PvCalculator.tsx       ← Hauptkomponente (Inputs, KPIs, Tabelle)
    NumberInput.tsx        ← Numerischer Input mit Komma-Support
    SavingsChart.tsx       ← SVG-Chart kumulierter Cashflow
```

## Branding

Markenfarben sind als Tailwind-Tokens in `src/index.css` als `@theme` definiert,
also überall als `bg-heizma-orange`, `text-heizma-ink`, … verfügbar.
Falls die exakten Hex-Werte aus dem Style-Guide abweichen, einfach dort anpassen.
