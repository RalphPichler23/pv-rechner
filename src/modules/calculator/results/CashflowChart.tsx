import type { YearRow } from "../../../lib/calc";
import { fmt } from "../../../lib/calc";

interface Props {
  rows: YearRow[];
  investment: number;
}

/**
 * Schlanker SVG-Chart: kumulierter Cashflow (Ersparnis − Investition).
 */
export function CashflowChart({ rows, investment }: Props) {
  const W = 700;
  const H = 240;
  const padL = 56;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const values = rows.map((r) => r.cumulativeSavings - investment);
  const minY = Math.min(0, ...values);
  const maxY = Math.max(0, ...values);
  const spanY = maxY - minY || 1;

  const xFor = (i: number) =>
    padL + (rows.length <= 1 ? 0 : (i / (rows.length - 1)) * innerW);
  const yFor = (v: number) => padT + innerH - ((v - minY) / spanY) * innerH;
  const zeroY = yFor(0);

  const polyPoints = rows
    .map((r, i) => `${xFor(i)},${yFor(r.cumulativeSavings - investment)}`)
    .join(" ");

  const areaPath = (positive: boolean) => {
    const segs: string[] = [];
    rows.forEach((r, i) => {
      const v = r.cumulativeSavings - investment;
      const y = positive ? Math.min(yFor(v), zeroY) : Math.max(yFor(v), zeroY);
      segs.push(`${i === 0 ? "M" : "L"}${xFor(i)},${y}`);
    });
    segs.push(`L${xFor(rows.length - 1)},${zeroY}`);
    segs.push(`L${xFor(0)},${zeroY}Z`);
    return segs.join(" ");
  };

  const ticks = 4;
  const tickValues = Array.from({ length: ticks + 1 }, (_, i) =>
    Math.round(minY + (i / ticks) * spanY),
  );
  const breakEvenIdx = rows.findIndex(
    (r) => r.cumulativeSavings - investment >= 0,
  );

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full min-w-[480px]"
        preserveAspectRatio="none"
      >
        {tickValues.map((v, i) => {
          const y = yFor(v);
          return (
            <g key={i}>
              <line
                x1={padL}
                x2={W - padR}
                y1={y}
                y2={y}
                className="stroke-heizma-border"
                strokeWidth={1}
                strokeDasharray={v === 0 ? "0" : "3 3"}
              />
              <text
                x={padL - 6}
                y={y + 4}
                textAnchor="end"
                className="fill-heizma-muted text-[10px] tabular-nums"
              >
                {fmt.eur(v)}
              </text>
            </g>
          );
        })}

        {rows.map((r, i) => {
          const shouldLabel =
            i === 0 ||
            i === rows.length - 1 ||
            (i + 1) % Math.max(1, Math.ceil(rows.length / 8)) === 0;
          if (!shouldLabel) return null;
          return (
            <text
              key={i}
              x={xFor(i)}
              y={H - 8}
              textAnchor="middle"
              className="fill-heizma-muted text-[10px]"
            >
              J{r.year}
            </text>
          );
        })}

        {minY < 0 && investment > 0 ? (
          <path d={areaPath(false)} className="fill-heizma-red/10" />
        ) : null}
        <path d={areaPath(true)} className="fill-heizma-green/20" />

        <polyline
          points={polyPoints}
          fill="none"
          className="stroke-heizma-green-dark"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {rows.map((r, i) => (
          <circle
            key={i}
            cx={xFor(i)}
            cy={yFor(r.cumulativeSavings - investment)}
            r={3}
            className="fill-heizma-surface stroke-heizma-green-dark"
            strokeWidth={1.5}
          />
        ))}

        {breakEvenIdx >= 0 && investment > 0 ? (
          <g>
            <line
              x1={xFor(breakEvenIdx)}
              x2={xFor(breakEvenIdx)}
              y1={padT}
              y2={H - padB}
              className="stroke-heizma-ink"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <text
              x={xFor(breakEvenIdx) + 6}
              y={padT + 14}
              className="fill-heizma-ink text-[11px] font-semibold"
            >
              Amortisation
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  );
}
