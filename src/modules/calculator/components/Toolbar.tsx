import type { TabMode } from "../../../lib/calc";
import { Tabs } from "./Tabs";

interface Props {
  tab: TabMode;
  onTabChange: (m: TabMode) => void;
  years: number;
}

export function Toolbar({ tab, onTabChange, years }: Props) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 print:hidden">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-heizma-ink">
          Amortisations­berechnung
        </h1>
        <p className="text-xs text-heizma-muted">
          Live-Berechnung über {years} Jahre · Datum:{" "}
          {new Date().toLocaleDateString("de-AT")}
        </p>
        <Tabs value={tab} onChange={onTabChange} />
      </div>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-xl bg-heizma-green px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-heizma-green-dark"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          aria-hidden
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" rx="1" />
        </svg>
        Als PDF speichern
      </button>
    </div>
  );
}
