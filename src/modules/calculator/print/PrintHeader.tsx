import type { TabMode } from "../../../lib/calc";

interface Props {
  tab: TabMode;
}

const titles: Record<TabMode, string> = {
  pv: "PV-Amortisation",
  wp: "Wärmepumpe-Amortisation",
  combined: "PV + Wärmepumpe – Komplettpaket",
};

export function PrintHeader({ tab }: Props) {
  return (
    <div className="flex items-baseline justify-between border-b-2 border-heizma-green pb-2">
      <div>
        <div className="text-2xl font-extrabold text-heizma-ink">
          Heizma <span className="text-heizma-green">·</span> {titles[tab]}
        </div>
        <div className="text-xs text-heizma-muted">
          Wirtschaftlichkeits-Berechnung
        </div>
      </div>
      <div className="text-right text-xs text-heizma-muted">
        Erstellt am {new Date().toLocaleDateString("de-AT")}
      </div>
    </div>
  );
}
