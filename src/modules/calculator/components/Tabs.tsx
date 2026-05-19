import type { TabMode } from "../../../lib/calc";

interface TabDef {
  id: TabMode;
  label: string;
  description: string;
}

const TABS: TabDef[] = [
  { id: "pv", label: "Nur PV-Anlage", description: "Strom-Eigenversorgung" },
  { id: "wp", label: "Nur Wärmepumpe", description: "Heizungstausch" },
  { id: "combined", label: "WP + PV", description: "Komplettpaket" },
];

interface Props {
  value: TabMode;
  onChange: (m: TabMode) => void;
}

export function Tabs({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-2xl border border-heizma-border bg-heizma-surface p-1 shadow-sm print:hidden">
      {TABS.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={
              "rounded-xl px-4 py-2 text-left transition " +
              (active
                ? "bg-heizma-green text-white shadow-sm"
                : "text-heizma-ink-soft hover:bg-heizma-bg")
            }
          >
            <div className="text-[13px] font-bold leading-tight">{t.label}</div>
            <div
              className={
                "text-[10.5px] leading-tight " +
                (active ? "text-white/85" : "text-heizma-muted")
              }
            >
              {t.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
