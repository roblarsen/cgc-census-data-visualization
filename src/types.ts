export type EraId = "golden-age" | "silver-age";

export type ChartMetric = "average" | "top50Average";

/** Describes how an era is charted. Values are precomputed census figures. */
export interface EraConfig {
  id: EraId;
  name: string;
  chartMetric: ChartMetric;
  metricLabel: string;
  yAxisLabel: string;
  sourceNote?: string;
}

export interface Comic {
  id: string;
  title: string;
  /** ISO 8601 calendar date, YYYY-MM-DD */
  date: string;
  average: number;
  top50Average?: number;
  pop9Plus?: number;
  population: number;
  value: number;
  link: string;
  rank: number;
}

export interface EraDataset {
  schemaVersion: 1;
  era: EraConfig;
  comics: Comic[];
}
