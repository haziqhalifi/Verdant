/**
 * Analytics value types.
 *
 * Wire types (`MetricSet`, `Lever`, `ChillerReading`, `MetricsResponse`) are shared
 * from `@verdant/shared`. Backend-only types (`MetricInput`, `ReadingsSummary`) stay here.
 */

export type { ChillerReading, MetricSet, Lever, MetricsResponse } from "@verdant/shared";

/** The inputs `computeMetrics` needs. Everything is explicit — no hidden globals. */
export interface MetricInput {
  baselineKwPerRt: number;
  currentKwPerRt: number;
  loadRt: number;
  tariffSgdPerKwh: number;
  /** Number of hours the drift is sustained over. */
  hours: number;
}

/** Derived from a raw reading series, so the card can be reproduced from telemetry alone. */
export interface ReadingsSummary {
  baselineKwPerRt: number;
  currentKwPerRt: number;
  loadRt: number;
  samples: number;
}
