import type { ChartMetric, Comic, EraDataset } from "./types";
import { isEraId } from "./eras";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses a strict ISO YYYY-MM-DD date as UTC midnight; null if invalid. */
export function parseIsoDate(iso: string): Date | null {
  const m = ISO_DATE.exec(iso);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== mo - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return date;
}

/** Joins a Vite BASE_URL (e.g. "/", "./", "/repo/") with a relative path. */
export function assetUrl(base: string, path: string): string {
  const b = base.endsWith("/") ? base : `${base}/`;
  return `${b}${path.replace(/^\/+/, "")}`;
}

export const dataUrl = (base: string, eraId: string): string =>
  assetUrl(base, `data/${eraId}.json`);

export const coverUrl = (base: string, eraId: string, comicId: string): string =>
  assetUrl(base, `img/${eraId}/${encodeURIComponent(comicId)}.jpg`);

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function isComic(v: unknown): v is Comic {
  if (typeof v !== "object" || v === null) return false;
  const c = v as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.title === "string" &&
    typeof c.date === "string" &&
    parseIsoDate(c.date) !== null &&
    typeof c.link === "string" &&
    isNum(c.average) &&
    isNum(c.population) &&
    isNum(c.value) &&
    isNum(c.rank) &&
    (c.top50Average === undefined || isNum(c.top50Average)) &&
    (c.pop9Plus === undefined || isNum(c.pop9Plus))
  );
}

/** Validates untyped JSON into an EraDataset, throwing a descriptive error. */
export function validateDataset(raw: unknown): EraDataset {
  if (typeof raw !== "object" || raw === null) throw new Error("Dataset is not an object");
  const d = raw as Record<string, unknown>;
  const era = d.era as Record<string, unknown> | undefined;
  if (
    d.schemaVersion !== 1 ||
    !era ||
    typeof era !== "object" ||
    !isEraId(era.id) ||
    typeof era.name !== "string" ||
    (era.chartMetric !== "average" && era.chartMetric !== "top50Average") ||
    typeof era.metricLabel !== "string" ||
    typeof era.yAxisLabel !== "string"
  ) {
    throw new Error("Dataset has an invalid schema or era configuration");
  }
  if (!Array.isArray(d.comics)) throw new Error("Dataset has no comics array");
  const bad = d.comics.findIndex((c) => !isComic(c));
  if (bad >= 0) throw new Error(`Invalid comic record at index ${bad}`);
  return raw as EraDataset;
}

/** Chooses the plotted metric: the era's preferred one if every comic has it. */
export function resolveMetric(dataset: EraDataset): ChartMetric {
  const wanted = dataset.era.chartMetric;
  if (wanted === "top50Average" && !dataset.comics.every((c) => isNum(c.top50Average))) {
    return "average";
  }
  return wanted;
}

export function metricValue(comic: Comic, metric: ChartMetric): number {
  return metric === "top50Average" ? (comic.top50Average ?? comic.average) : comic.average;
}

export function metricLabels(dataset: EraDataset, metric: ChartMetric): string {
  if (metric === dataset.era.chartMetric) return dataset.era.yAxisLabel;
  return "Average Grade";
}

export async function loadEra(
  base: string,
  eraId: string,
  fetchFn: typeof fetch = fetch,
  signal?: AbortSignal
): Promise<EraDataset> {
  const res = await fetchFn(dataUrl(base, eraId), signal ? { signal } : undefined);
  if (!res.ok) throw new Error(`Failed to load ${eraId} data (HTTP ${res.status})`);
  const dataset = validateDataset(await res.json());
  if (dataset.era.id !== eraId) throw new Error(`Dataset era mismatch for ${eraId}`);
  return dataset;
}
