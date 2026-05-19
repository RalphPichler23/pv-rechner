import type { ReactNode } from "react";
import type { YearRow } from "../../../lib/calc";
import { fmt } from "../../../lib/calc";

interface Props {
  rows: YearRow[];
  investment: number;
  amortizationYear: number | null;
}

function Th({ children, align }: { children: ReactNode; align?: "right" }) {
  return (
    <th
      scope="col"
      className={
        "whitespace-nowrap px-4 py-2.5 " +
        (align === "right" ? "text-right" : "text-left")
      }
    >
      {children}
    </th>
  );
}

function Td({ children, align }: { children: ReactNode; align?: "right" }) {
  return (
    <td
      className={
        "whitespace-nowrap px-4 py-2.5 tabular-nums " +
        (align === "right" ? "text-right" : "text-left")
      }
    >
      {children}
    </td>
  );
}

export function ResultTable({ rows, investment, amortizationYear }: Props) {
  const showInvest = investment > 0;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-heizma-bg text-left text-[11px] font-semibold uppercase tracking-wider text-heizma-muted">
            <Th>Jahr</Th>
            <Th align="right">Strompreis (ct/kWh)</Th>
            <Th align="right">PV-Prod. (kWh)</Th>
            <Th align="right">Netzbezug (kWh)</Th>
            <Th align="right">Einspeisung (kWh)</Th>
            <Th align="right">Ohne PV (€)</Th>
            <Th align="right">Mit PV (€)</Th>
            <Th align="right">Ersparnis (€)</Th>
            <Th align="right">Kumuliert (€)</Th>
            {showInvest ? <Th align="right">vs. Investition</Th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isAmort = r.year === amortizationYear;
            return (
              <tr
                key={r.year}
                className={
                  "border-t border-heizma-border/70 " +
                  (isAmort
                    ? "bg-heizma-green-soft/60 font-semibold text-heizma-ink"
                    : "hover:bg-heizma-bg/60")
                }
              >
                <Td>
                  <div className="flex items-center gap-2">
                    <span>Jahr {r.year}</span>
                    {isAmort ? (
                      <span className="rounded-full bg-heizma-green px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Break-Even
                      </span>
                    ) : null}
                  </div>
                </Td>
                <Td align="right">{fmt.cents(r.electricityPrice)}</Td>
                <Td align="right">{fmt.int(r.pvProduction)}</Td>
                <Td align="right">{fmt.int(r.gridConsumption)}</Td>
                <Td align="right">{fmt.int(r.feedIn)}</Td>
                <Td align="right">{fmt.eur(r.costWithoutPv)}</Td>
                <Td align="right">
                  <span
                    className={
                      r.costWithPv < 0 ? "text-heizma-green" : "text-heizma-ink"
                    }
                  >
                    {fmt.eur(r.costWithPv)}
                  </span>
                </Td>
                <Td align="right">
                  <span className="font-semibold text-heizma-green-dark">
                    {fmt.eur(r.savings)}
                  </span>
                </Td>
                <Td align="right">{fmt.eur(r.cumulativeSavings)}</Td>
                {showInvest ? (
                  <Td align="right">
                    <span
                      className={
                        r.netCashflow >= 0
                          ? "text-heizma-green"
                          : "text-heizma-muted"
                      }
                    >
                      {fmt.eur(r.netCashflow)}
                    </span>
                  </Td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
