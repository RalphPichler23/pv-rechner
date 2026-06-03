import type { ReactNode } from "react";

interface StepProps {
  label: string;
  formula: string;
  result: string;
  /** optionaler Untertitel/Hinweis */
  hint?: string;
  /** Hervorhebung als Endergebnis */
  highlight?: boolean;
}

export function Step({ label, formula, result, hint, highlight }: StepProps) {
  return (
    <div
      className={
        "grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-0.5 " +
        (highlight ? "rounded-lg bg-heizma-green-soft/60 px-3 py-2" : "")
      }
    >
      <div>
        <div className="text-[12.5px] font-medium text-heizma-ink-soft">
          {label}
        </div>
        <div className="text-[11.5px] tabular-nums text-heizma-muted">
          {formula}
        </div>
        {hint ? (
          <div className="text-[11px] text-heizma-muted">{hint}</div>
        ) : null}
      </div>
      <div
        className={
          "whitespace-nowrap text-right text-sm font-bold tabular-nums " +
          (highlight ? "text-heizma-green-dark" : "text-heizma-ink")
        }
      >
        {result}
      </div>
    </div>
  );
}

interface GroupProps {
  title: string;
  children: ReactNode;
}

export function Group({ title, children }: GroupProps) {
  return (
    <div className="rounded-xl border border-heizma-border/70 bg-heizma-bg/40 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-heizma-muted">
        {title}
      </div>
      <div className="mt-3 space-y-2.5">{children}</div>
    </div>
  );
}
