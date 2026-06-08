import type { PvInputs } from "../../../lib/calc";
import { fmt } from "../../../lib/calc";
import { Fieldset } from "../components/Fieldset";
import { NumberInput } from "../components/NumberInput";
import type { Setter } from "./types";

interface Props {
  input: PvInputs;
  set: Setter;
  /** ob die "bestehende WP"-Checkbox angezeigt werden soll
   *  (entfällt im WP-Tab und combined-Tab, weil dort die volle WP-Rechnung läuft) */
  showExistingWp: boolean;
}

/** Konfiguration eines Zusatzverbrauchers — verlinkt UI auf PvInputs-Felder. */
interface ConsumerDef {
  key: string;
  icon: string;
  label: string;
  hint: string;
  inputHint?: string;
  enabledKey: keyof PvInputs;
  kwhKey: keyof PvInputs;
  /** Nur im PV-Tab sichtbar (für "bestehende WP", weil im WP/Combined-Tab volle Rechnung) */
  onlyPv?: boolean;
}

const CONSUMERS: ConsumerDef[] = [
  {
    key: "wp",
    icon: "🔥",
    label: "Wärmepumpe (bereits vorhanden)",
    hint: "Wenn schon eine WP da ist – Stromverbrauch der WP eingeben",
    inputHint: "typ. 3.000 – 5.000 kWh/J",
    enabledKey: "existingWpEnabled",
    kwhKey: "existingWpKwhPerYear",
    onlyPv: true,
  },
  {
    key: "ev",
    icon: "🚗",
    label: "E-Auto",
    hint: "Erhöht Autarkie (ganzjährig + Überschussladen)",
    inputHint: "12.000 km × 18 kWh/100km ≈ 2.500 kWh",
    enabledKey: "evEnabled",
    kwhKey: "evKwhPerYear",
  },
  {
    key: "pool",
    icon: "🏊",
    label: "Pool",
    hint: "Filterpumpe + ggf. Heizung. Läuft im Sommer = perfekte PV-Deckung",
    inputHint: "typ. 2.000 – 4.000 kWh/J",
    enabledKey: "poolEnabled",
    kwhKey: "poolKwhPerYear",
  },
  {
    key: "ac",
    icon: "❄️",
    label: "Klimaanlage",
    hint: "Sommer-Last fällt zur PV-Spitze – sehr gute Deckung",
    inputHint: "Split-Gerät EFH typ. 300 – 600 kWh/J",
    enabledKey: "acEnabled",
    kwhKey: "acKwhPerYear",
  },
  {
    key: "sauna",
    icon: "🧖",
    label: "Sauna",
    hint: "Oft abends / Wochenende – mittlere PV-Deckung",
    inputHint: "typ. 1.000 – 2.000 kWh/J",
    enabledKey: "saunaEnabled",
    kwhKey: "saunaKwhPerYear",
  },
  {
    key: "whirlpool",
    icon: "♨️",
    label: "Whirlpool / Outdoor-Hottub",
    hint: "Ganzjährig beheizt (auch nachts) – geringere PV-Deckung",
    inputHint: "typ. 2.500 – 4.000 kWh/J",
    enabledKey: "whirlpoolEnabled",
    kwhKey: "whirlpoolKwhPerYear",
  },
];

export function ExtraConsumersSection({ input, set, showExistingWp }: Props) {
  const visible = CONSUMERS.filter((c) => !c.onlyPv || showExistingWp);

  const totalExtra = visible.reduce((sum, c) => {
    const enabled = input[c.enabledKey] as boolean;
    if (!enabled) return sum;
    return sum + (input[c.kwhKey] as number);
  }, 0);

  return (
    <Fieldset legend="Zusatzverbraucher (bestehende Geräte)">
      <p className="-mt-1 mb-2 text-[11px] text-heizma-muted">
        Erhöht den Stromverbrauch und wird in der Autarkie-Empfehlung
        berücksichtigt. Sommer-Verbraucher (Pool, Klima) werden besser durch
        PV gedeckt als Winter-Verbraucher (WP).
      </p>

      <div className="space-y-3">
        {visible.map((c) => (
          <ConsumerToggle
            key={c.key}
            def={c}
            enabled={input[c.enabledKey] as boolean}
            value={input[c.kwhKey] as number}
            onToggle={(v) => set(c.enabledKey, v as never)}
            onChange={(v) => set(c.kwhKey, v as never)}
          />
        ))}
      </div>

      {/* Sub-Option für bestehende WP: ins EMS einbinden? */}
      {showExistingWp && input.existingWpEnabled && input.emsEnabled ? (
        <label className="mt-3 flex items-start gap-3 rounded-xl border border-heizma-border bg-heizma-bg/60 p-3">
          <input
            type="checkbox"
            checked={input.wpEmsIntegrated}
            onChange={(e) => set("wpEmsIntegrated", e.target.checked)}
            className="mt-0.5 h-4 w-4 cursor-pointer accent-heizma-green"
          />
          <div className="flex-1">
            <div className="text-[13px] font-medium text-heizma-ink-soft">
              🔗 Bestehende WP ins EMS einbindbar
            </div>
            <div className="mt-0.5 text-[11px] text-heizma-muted">
              EMS kann die WP tagsüber laufen lassen (PV-Überschuss) und Puffer-
              speicher gezielt laden. Hebt den WP-Synergie-Faktor 60 % → 80 %.
            </div>
          </div>
        </label>
      ) : null}

      {totalExtra > 0 ? (
        <div className="mt-3 rounded-lg bg-heizma-green-soft/60 px-3 py-2 text-[12px] text-heizma-ink-soft">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-medium">Zusatzverbrauch gesamt</span>
            <span className="font-bold tabular-nums text-heizma-green-dark">
              +{fmt.int(totalExtra)} kWh/J
            </span>
          </div>
        </div>
      ) : null}
    </Fieldset>
  );
}

interface ToggleProps {
  def: ConsumerDef;
  enabled: boolean;
  value: number;
  onToggle: (v: boolean) => void;
  onChange: (v: number) => void;
}

function ConsumerToggle({ def, enabled, value, onToggle, onChange }: ToggleProps) {
  return (
    <div>
      <label className="flex items-start gap-3 rounded-xl border border-heizma-border bg-heizma-bg/60 p-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-0.5 h-4 w-4 cursor-pointer accent-heizma-green"
        />
        <div className="flex-1">
          <div className="text-[13px] font-medium text-heizma-ink-soft">
            <span aria-hidden className="mr-1.5">
              {def.icon}
            </span>
            {def.label}
          </div>
          <div className="mt-0.5 text-[11px] text-heizma-muted">{def.hint}</div>
        </div>
      </label>
      {enabled ? (
        <div className="mt-2">
          <NumberInput
            label="Strom / Jahr"
            unit="kWh/J"
            value={value}
            onChange={onChange}
            min={0}
            step={250}
            decimals={0}
            hint={def.inputHint}
          />
        </div>
      ) : null}
    </div>
  );
}
