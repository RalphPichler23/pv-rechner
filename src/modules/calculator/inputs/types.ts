import type { PvInputs } from "../../../lib/calc";

export type Setter = <K extends keyof PvInputs>(key: K, value: PvInputs[K]) => void;
