// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startApp, type App } from "../src/app";

const html = readFileSync("index.html", "utf8").match(/<body>([\s\S]*)<\/body>/)![1]!;

const json = (era: string) => readFileSync(`public/data/${era}.json`, "utf8");
const respond = (era: string) =>
  Promise.resolve(new Response(json(era), { status: 200 }));

let app: App | undefined;
beforeEach(() => {
  document.body.innerHTML = html;
  window.history.replaceState(null, "", "/repo/");
});
afterEach(() => app?.destroy());

const count = (sel: string) => document.querySelectorAll(sel).length;
const eraFromUrl = () => new URLSearchParams(window.location.search).get("era");

describe("app", () => {
  it("renders the default era and syncs the URL", async () => {
    const fetchFn = vi.fn((url: RequestInfo | URL) => respond(String(url).includes("silver") ? "silver-age" : "golden-age"));
    app = startApp({ base: "/repo/", fetchFn: fetchFn as typeof fetch });
    await app.ready();
    expect(eraFromUrl()).toBe("golden-age");
    expect(String(fetchFn.mock.calls[0]![0])).toBe("/repo/data/golden-age.json");
    expect(count("svg")).toBe(1);
    expect(count("#datagrid tr")).toBe(20);
    expect(document.querySelector("image")?.getAttribute("href")).toMatch(/^\/repo\/img\/golden-age\//);
    expect(document.querySelector("clipPath")?.id).toMatch(/^clip-golden-age-/);
  });

  it("falls back from unknown eras and handles repeated switching without duplicates", async () => {
    window.history.replaceState(null, "", "/repo/?era=bronze");
    app = startApp({ base: "/repo/", fetchFn: ((u: string) => respond(u.includes("silver") ? "silver-age" : "golden-age")) as unknown as typeof fetch });
    await app.ready();
    expect(eraFromUrl()).toBe("golden-age");

    const select = document.getElementById("era-select") as HTMLSelectElement;
    for (const era of ["silver-age", "golden-age", "silver-age"]) {
      select.value = era;
      select.dispatchEvent(new Event("change"));
      await app.ready();
      expect(count("svg")).toBe(1);
      expect(count(".tooltip")).toBe(1);
      expect(count("#datagrid tr")).toBe(era === "silver-age" ? 25 : 20);
      const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
    expect(eraFromUrl()).toBe("silver-age");
    expect(document.querySelector("text.label:last-of-type")?.textContent).toBe("Top 50 Average Grade");

    window.history.back();
    await new Promise((r) => setTimeout(r, 50));
    await app.ready();
    expect(select.value).toBe("golden-age");
    expect(count("#datagrid tr")).toBe(20);
  });

  it("ignores out-of-order responses", async () => {
    let releaseGolden!: () => void;
    const fetchFn = ((u: string) => u.includes("golden")
      ? new Promise<Response>((res) => { releaseGolden = () => res(new Response(json("golden-age"))); })
      : respond("silver-age")) as unknown as typeof fetch;
    app = startApp({ base: "/repo/", fetchFn });
    const select = document.getElementById("era-select") as HTMLSelectElement;
    select.value = "silver-age";
    select.dispatchEvent(new Event("change"));
    await app.ready();
    releaseGolden();
    await new Promise((r) => setTimeout(r, 10));
    expect(count("#datagrid tr")).toBe(25);
    expect(count("svg")).toBe(1);
  });

  it("shows an error when loading fails", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    app = startApp({ base: "/repo/", fetchFn: (() => Promise.resolve(new Response("", { status: 404 }))) as unknown as typeof fetch });
    await app.ready();
    expect(document.getElementById("status")?.getAttribute("role")).toBe("alert");
    expect(count("svg")).toBe(0);
    spy.mockRestore();
  });
});
