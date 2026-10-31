import { loadEra } from "./data";
import { drawBubbleChart } from "./drawBubbleChart";
import { drawTable } from "./drawTable";
import { DEFAULT_ERA, ERAS, parseEraParam } from "./eras";
import type { EraId } from "./types";

export interface AppOptions {
  base: string;
  doc?: Document;
  win?: Window;
  fetchFn?: typeof fetch;
}

export interface App {
  /** Resolves once the most recent load has settled. */
  ready(): Promise<void>;
  destroy(): void;
}

export function startApp(options: AppOptions): App {
  const doc = options.doc ?? document;
  const win = options.win ?? window;
  const fetchFn = options.fetchFn ?? ((...args) => fetch(...args));
  const byId = <T extends HTMLElement>(id: string): T => {
    const el = doc.getElementById(id);
    if (!el) throw new Error(`Missing #${id} element`);
    return el as T;
  };

  const select = byId<HTMLSelectElement>("era-select");
  const chart = byId("chart");
  const body = byId("datagrid");
  const status = byId("status");
  const heading = byId("era-heading");

  select.replaceChildren(
    ...ERAS.map((era) => {
      const o = doc.createElement("option");
      o.value = era.id;
      o.textContent = era.name;
      return o;
    })
  );

  let requestId = 0;
  let controller: AbortController | null = null;
  let pending: Promise<void> = Promise.resolve();

  const setStatus = (message: string, isError = false) => {
    status.textContent = message;
    status.setAttribute("role", isError ? "alert" : "status");
  };

  const clear = () => {
    chart.replaceChildren();
    body.replaceChildren();
  };

  const show = (eraId: EraId): Promise<void> => {
    const id = ++requestId;
    controller?.abort();
    controller = new AbortController();
    const { signal } = controller;
    select.value = eraId;
    clear();
    setStatus("Loading…");

    return loadEra(options.base, eraId, fetchFn, signal).then(
      (dataset) => {
        if (id !== requestId) return; // a newer request superseded this one
        clear();
        heading.textContent = `${dataset.era.name} CGC Census`;
        doc.title = `${dataset.era.name} CGC Census`;
        drawBubbleChart(dataset, chart, options.base);
        drawTable(dataset.comics, body);
        setStatus(`Showing ${dataset.era.name} data.`);
      },
      (err: unknown) => {
        if (id !== requestId) return;
        console.error("Error loading data:", err);
        clear();
        setStatus(`Sorry, the ${eraId} data could not be loaded.`, true);
      }
    );
  };

  const urlFor = (eraId: EraId) => {
    const params = new URLSearchParams(win.location.search);
    params.set("era", eraId);
    return `${win.location.pathname}?${params.toString()}${win.location.hash}`;
  };

  const initial = parseEraParam(win.location.search) ?? DEFAULT_ERA;
  win.history.replaceState(null, "", urlFor(initial));
  pending = show(initial);

  const onChange = () => {
    const eraId = select.value as EraId;
    if (eraId === parseEraParam(win.location.search)) return;
    win.history.pushState(null, "", urlFor(eraId));
    pending = show(eraId);
  };
  const onPopState = () => {
    pending = show(parseEraParam(win.location.search) ?? DEFAULT_ERA);
  };

  select.addEventListener("change", onChange);
  win.addEventListener("popstate", onPopState);

  return {
    ready: async () => {
      let current: Promise<void>;
      do {
        current = pending;
        await current;
      } while (current !== pending);
    },
    destroy: () => {
      requestId++;
      controller?.abort();
      select.removeEventListener("change", onChange);
      win.removeEventListener("popstate", onPopState);
    }
  };
}
