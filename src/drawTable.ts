import { formatDate, formatMoney, renderEmpty, safeHref } from "./format";
import type { Comic } from "./types";

export function drawTable(data: Comic[], body: HTMLElement): void {
  if (data.length === 0) {
    body.replaceChildren();
    const row = document.createElement("tr");
    const cell = row.insertCell();
    cell.colSpan = 4;
    renderEmpty(cell, "No census data available.");
    body.append(row);
    return;
  }

  const rows = data.map((d) => {
    const tr = document.createElement("tr");
    const rank = tr.insertCell();
    rank.textContent = String(d.rank);

    const title = tr.insertCell();
    const href = safeHref(d.link);
    if (href) {
      const a = document.createElement("a");
      a.href = href;
      a.textContent = d.title;
      title.append(a);
    } else {
      title.textContent = d.title;
    }

    tr.insertCell().textContent = formatMoney(d.value);
    tr.insertCell().textContent = formatDate(d.date);
    return tr;
  });
  body.replaceChildren(...rows);
}
