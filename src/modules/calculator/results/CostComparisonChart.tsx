import type { YearRow } from "../../../lib/calc";
import { fmt } from "../../../lib/calc";

interface Props {
  rows: YearRow[];
  investment: number;
}

/**
 * Kostenvergleich über die Zeit.
 *
 *  Linie A (rot):   kumulierte Status-quo-Kosten   = Σ costWithoutPv
 *  Linie B (grün):  Investition + kumulierte neue Kosten = totalInvestment + Σ costWithPv
 *
 * Schnittpunkt = Jahr, in dem die Investition + neue Kosten die Status-quo-
 * Kosten unterschreiten ⇒ Amortisation.
 */
export function CostComparisonChart({ rows, investment }: Props) {
  // Kumulative Werte berechnen.
  // Einspeise-Erlöse können sich real ansammeln (Geld aufs Konto), daher
  // dürfen die jährlichen Netto-Stromkosten negativ sein und kumulieren.
  // Mit der Strompreis-Steigerung kippt das pro Jahr nach ~15-20 J ins
  // Positive und die Linie beginnt zu steigen.
  const points = rows.map((r, i, arr) => {
    const sumWithout = arr.slice(0, i + 1).reduce((s, x) => s + x.costWithoutPv, 0);
    const sumWith = arr.slice(0, i + 1).reduce((s, x) => s + x.costWithPv, 0);
    return {
      year: r.year,
      statusQuo: sumWithout,
      withInvestment: investment + sumWith,
    };
  });

  // Startpunkt (Jahr 0): Status quo = 0, Mit Investition = Investition
  const allPoints = [
    { year: 0, statusQuo: 0, withInvestment: investment },
    ...points,
  ];

  const W = 700;
  const H = 260;
  const padL = 64;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const minY = 0;
  const maxY = Math.max(
    ...allPoints.map((p) => Math.max(p.statusQuo, p.withInvestment)),
  );
  const spanY = maxY - minY || 1;

  const xFor = (i: number) => padL + (i / (allPoints.length - 1)) * innerW;
  const yFor = (v: number) => padT + innerH - ((v - minY) / spanY) * innerH;

  const pathFor = (key: "statusQuo" | "withInvestment") =>
    allPoints.map((p, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(p[key])}`).join(" ");

  // Schnittpunkt finden (Status quo überholt Mit-Investition)
  let breakEvenX: number | null = null;
  for (let i = 1; i < allPoints.length; i++) {
    const prev = allPoints[i - 1];
    const cur = allPoints[i];
    const prevDiff = prev.statusQuo - prev.withInvestment;
    const curDiff = cur.statusQuo - cur.withInvestment;
    if (prevDiff < 0 && curDiff >= 0) {
      // linear interpolieren
      const t = -prevDiff / (curDiff - prevDiff);
      breakEvenX = xFor(i - 1) + t * (xFor(i) - xFor(i - 1));
      break;
    }
  }

  // Y-Achsen-Ticks
  const ticks = 4;
  const tickValues = Array.from({ length: ticks + 1 }, (_, i) =>
    Math.round((i / ticks) * maxY),
  );

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full min-w-[480px]"
        preserveAspectRatio="none"
      >
        {/* Y-Achse Grid + Labels */}
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
                strokeDasharray="3 3"
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

        {/* X-Achse Beschriftung */}
        {allPoints.map((p, i) => {
          const shouldLabel =
            i === 0 ||
            i === allPoints.length - 1 ||
            (i + 1) % Math.max(1, Math.ceil(allPoints.length / 8)) === 0;
          if (!shouldLabel) return null;
          return (
            <text
              key={i}
              x={xFor(i)}
              y={H - 8}
              textAnchor="middle"
              className="fill-heizma-muted text-[10px]"
            >
              J{p.year}
            </text>
          );
        })}

        {/* Linie A: Status quo (rot) */}
        <path
          d={pathFor("statusQuo")}
          fill="none"
          className="stroke-heizma-red"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {allPoints.map((p, i) => (
          <circle
            key={`a-${i}`}
            cx={xFor(i)}
            cy={yFor(p.statusQuo)}
            r={2.5}
            className="fill-heizma-surface stroke-heizma-red"
            strokeWidth={1.2}
          />
        ))}

        {/* Linie B: Mit Investition (grün) */}
        <path
          d={pathFor("withInvestment")}
          fill="none"
          className="stroke-heizma-green-dark"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {allPoints.map((p, i) => (
          <circle
            key={`b-${i}`}
            cx={xFor(i)}
            cy={yFor(p.withInvestment)}
            r={2.5}
            className="fill-heizma-surface stroke-heizma-green-dark"
            strokeWidth={1.2}
          />
        ))}

        {/* Schnittpunkt-Marker */}
        {breakEvenX !== null ? (
          <g>
            <line
              x1={breakEvenX}
              x2={breakEvenX}
              y1={padT}
              y2={H - padB}
              className="stroke-heizma-ink"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <text
              x={breakEvenX + 6}
              y={padT + 14}
              className="fill-heizma-ink text-[11px] font-semibold"
            >
              Break-Even
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  );
}
