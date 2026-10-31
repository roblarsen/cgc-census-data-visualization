import * as d3 from "d3";
import { parseIsoDate } from "./data";

const fmtDate = d3.utcFormat("%B %-d, %Y");

export const formatCount = d3.format(",");
export const formatMoney = d3.format("$,");

export function formatDate(iso: string): string {
  const d = parseIsoDate(iso);
  return d ? fmtDate(d) : iso;
}

/** Only http(s) links are rendered as anchors. */
export function safeHref(link: string): string | null {
  try {
    const u = new URL(link);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}

export function renderEmpty(container: Element, message: string): void {
  const p = document.createElement("p");
  p.className = "empty-message";
  p.textContent = message;
  container.replaceChildren(p);
}
