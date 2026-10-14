/**
 * Analytics value types — shared wire types.
 *
 * These numbers are the decision card's spine. They are computed in the backend,
 * never by a model.
 */

export interface ChillerReading {
  ts: string;
  loadRt: number;
  kwPerRt: number;
}

export interface MetricSet {
  baselineKwPerRt: number;
  currentKwPerRt: number;
  driftKwPerRt: number;
  loadRt: number;
  hours: number;
  excessKw: number;
  excessKwh: number;
  excessSgd: number;
  weatherNormalisedKwh: number;
  weatherNormalisedSgd: number;
  tariffSgdPerKwh: number;
}

export interface Lever {
  id: string;
  label: string;
  kwh: number;
  sgd: number;
  note: string;
}

export interface MetricsResponse {
  metrics: MetricSet;
  summary: string;
  levers: Lever[];
  source: "telemetry" | "hero_inputs";
}
