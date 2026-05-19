import type { ReactNode } from "react";

interface Props {
  legend: string;
  children: ReactNode;
}

export function Fieldset({ legend, children }: Props) {
  return (
    <fieldset className="mt-5 border-t border-heizma-border pt-4 first:mt-4 first:border-t-0 first:pt-0">
      <legend className="-mb-1 text-[11px] font-semibold uppercase tracking-wider text-heizma-muted">
        {legend}
      </legend>
      <div className="mt-3">{children}</div>
    </fieldset>
  );
}
