import { useState } from "react";

interface Props {
  label: string;
  value: number;
  onChange: (n: number) => void;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  decimals?: number;
  hint?: string;
}

/**
 * Numerischer Input mit deutscher Eingabe (Komma erlaubt).
 * Lokaler Draft während Fokus, sonst synchron mit `value` von außen.
 */
export function NumberInput({
  label,
  value,
  onChange,
  unit,
  step = 1,
  min,
  max,
  decimals,
  hint,
}: Props) {
  const format = (n: number) =>
    decimals !== undefined ? n.toFixed(decimals) : String(n);

  const [draft, setDraft] = useState<string | null>(null);
  const display = draft ?? format(value);

  const commit = (raw: string) => {
    const normalized = raw.replace(",", ".").trim();
    if (normalized === "" || normalized === "-") {
      onChange(min ?? 0);
      setDraft(null);
      return;
    }
    const n = Number(normalized);
    if (Number.isFinite(n)) {
      let clamped = n;
      if (min !== undefined) clamped = Math.max(min, clamped);
      if (max !== undefined) clamped = Math.min(max, clamped);
      onChange(clamped);
    }
    setDraft(null);
  };

  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-heizma-ink-soft">
        {label}
      </span>
      <div className="mt-1.5 flex items-stretch overflow-hidden rounded-xl border border-heizma-border bg-heizma-surface shadow-xs transition focus-within:border-heizma-green focus-within:ring-2 focus-within:ring-heizma-green/20">
        <input
          type="text"
          inputMode="decimal"
          value={display}
          step={step}
          onFocus={() => setDraft(format(value))}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="w-full min-w-0 bg-transparent px-3 py-2.5 text-right text-base font-semibold tabular-nums text-heizma-ink outline-none"
        />
        {unit ? (
          <span className="flex items-center whitespace-nowrap border-l border-heizma-border bg-heizma-bg px-2.5 text-xs font-medium text-heizma-muted">
            {unit}
          </span>
        ) : null}
      </div>
      {hint ? (
        <span className="mt-1 block text-xs text-heizma-muted">{hint}</span>
      ) : null}
    </label>
  );
}
