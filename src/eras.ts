import type { EraId } from "./types";

export const ERAS: ReadonlyArray<{ id: EraId; name: string }> = [
  { id: "golden-age", name: "Golden Age" },
  { id: "silver-age", name: "Silver Age" }
];

export const DEFAULT_ERA: EraId = "golden-age";

export function isEraId(value: unknown): value is EraId {
  return ERAS.some((e) => e.id === value);
}

/** Returns the era for a ?era= query value, or null when absent/unknown. */
export function parseEraParam(search: string): EraId | null {
  const value = new URLSearchParams(search).get("era");
  return isEraId(value) ? value : null;
}
