import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  assetUrl, coverUrl, dataUrl, metricLabels, metricValue,
  parseIsoDate, resolveMetric, validateDataset
} from "../src/data";
import type { EraDataset } from "../src/types";

const read = (era: string): unknown =>
  JSON.parse(readFileSync(`public/data/${era}.json`, "utf8"));

describe("migrated datasets", () => {
  it.each([
    ["golden-age", 20, "average"],
    ["silver-age", 25, "top50Average"]
  ])("%s validates with ISO dates and all records", (era, count, metric) => {
    const ds = validateDataset(read(era));
    expect(ds.comics).toHaveLength(count);
    expect(ds.era.chartMetric).toBe(metric);
    for (const c of ds.comics) {
      expect(c.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(existsSync(`public/img/${era}/${c.id}.jpg`)).toBe(true);
    }
  });

  it("fixes the invalid Marvel Comics #1 date", () => {
    const ds = validateDataset(read("golden-age"));
    expect(ds.comics.find((c) => c.id === "marvel-comics-1")?.date).toBe("1939-09-30");
  });
});

describe("dates", () => {
  it("parses ISO dates in UTC", () => {
    expect(parseIsoDate("1962-06-05")?.toISOString()).toBe("1962-06-05T00:00:00.000Z");
  });
  it.each(["09/31/1939", "1939-09-31", "1939-9-3", "", "2024-02-30"])(
    "rejects %s", (v) => expect(parseIsoDate(v)).toBeNull());
});

describe("metrics", () => {
  const base = validateDataset(read("silver-age"));
  it("uses top50Average when available", () => {
    expect(resolveMetric(base)).toBe("top50Average");
    expect(metricLabels(base, "top50Average")).toBe("Top 50 Average Grade");
  });
  it("falls back to average when top50Average is missing", () => {
    const ds: EraDataset = {
      ...base,
      comics: base.comics.map((c, i) => {
        const copy = { ...c };
        if (i === 0) delete copy.top50Average;
        return copy;
      })
    };
    expect(resolveMetric(ds)).toBe("average");
    expect(metricValue(ds.comics[0]!, "average")).toBe(ds.comics[0]!.average);
    expect(metricLabels(ds, "average")).toBe("Average Grade");
  });
  it("rejects malformed datasets", () => {
    expect(() => validateDataset({})).toThrow();
    expect(() => validateDataset({ ...base, comics: [{ id: "x" }] })).toThrow();
  });
});

describe("base paths", () => {
  it.each([
    ["/", "/data/golden-age.json"],
    ["./", "./data/golden-age.json"],
    ["/repo", "/repo/data/golden-age.json"],
    ["/repo/", "/repo/data/golden-age.json"]
  ])("dataUrl(%s)", (b, out) => expect(dataUrl(b, "golden-age")).toBe(out));
  it("builds cover URLs under the base", () => {
    expect(coverUrl("/repo/", "silver-age", "x-men-1")).toBe("/repo/img/silver-age/x-men-1.jpg");
    expect(assetUrl("/repo/", "/a.png")).toBe("/repo/a.png");
  });
});
