import * as d3 from "d3";
import { coverUrl, metricLabels, metricValue, parseIsoDate, resolveMetric } from "./data";
import { formatCount, formatDate, formatMoney, renderEmpty } from "./format";
import type { Comic, EraDataset } from "./types";

export function drawBubbleChart(
  dataset: EraDataset,
  container: HTMLElement,
  base: string
): void {
  const era = dataset.era;
  container.replaceChildren();

  const data = dataset.comics
    .filter((d) => parseIsoDate(d.date) !== null)
    .sort((a, b) => b.population - a.population);

  if (data.length === 0) {
    renderEmpty(container, "No census data available.");
    return;
  }

  const metric = resolveMetric(dataset);
  const yValue = (d: Comic) => metricValue(d, metric);
  const dateOf = (d: Comic) => parseIsoDate(d.date) as Date;

  const years = data.map((d) => dateOf(d).getUTCFullYear());
  const maxPop = d3.max(data, (d) => d.population) ?? 1;
  const [lo, hi] = d3.extent(data, yValue) as [number, number];
  const pad = metric === "top50Average" ? { up: 0.35, down: 0.5 } : { up: 1, down: 1 };
  const maxGrade = Math.min(hi + pad.up, 10);
  const minGrade = Math.max(lo - pad.down, 0);
  const minYear = d3.min(years) ?? 0;
  const maxYear = (d3.max(years) ?? 0) + 1;

  const canvasWidth = container.clientWidth || document.body.offsetWidth || 960;
  const ratio = 0.55;
  const margin = { top: 10, right: 50, bottom: 60, left: 60 };
  const width = Math.max(canvasWidth - margin.left - margin.right, 200);
  const height = Math.max(canvasWidth * ratio - margin.top - margin.bottom, 200);

  const root = d3.select(container);

  const svg = root
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("role", "img")
    .attr("aria-label", `${era.name} comics: ${era.yAxisLabel} by release date`)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const tooltip = root
    .append("div")
    .style("display", "none")
    .attr("class", "tooltip")
    .attr("role", "tooltip");

  const x = d3.scaleUtc(
    [new Date(Date.UTC(minYear, 0, 1)), new Date(Date.UTC(maxYear, 0, 1))],
    [0, width]
  );
  const y = d3.scaleLinear().domain([minGrade, maxGrade]).range([height, 0]);

  svg.append("g").call(d3.axisLeft(y).tickFormat(() => "").ticks(5).tickSizeInner(-width));
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(() => "").ticks(5).tickSizeInner(-height));
  svg.append("g").call(d3.axisLeft(y));
  svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));

  // Use scaleSqrt so area scales proportionally to population,
  // and cap max diameter at 110px so the largest books don't swallow their neighbours
  const z = d3.scaleSqrt().domain([0, maxPop]).range([24, 110]);

  const clipId = (d: Comic) => `clip-${era.id}-${d.id}`;
  const cx = (d: Comic) => x(dateOf(d));
  const cy = (d: Comic) => y(yValue(d));
  const r = (d: Comic) => z(d.population) / 2;

  svg
    .append("defs")
    .selectAll("clipPath")
    .data(data)
    .join("clipPath")
    .attr("id", clipId)
    .append("circle")
    .attr("cx", cx)
    .attr("cy", cy)
    .attr("r", r);

  // Wrapper <g> per book so drop-shadow isn't clipped by the image's clip-path
  // and a crisp border ring can be drawn around each cover.
  const nodes = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll<SVGGElement, Comic>("g.comic-node")
    .data(data)
    .join("g")
    .attr("class", "comic-node")
    .attr("id", (d) => `node-${era.id}-${d.id}`);

  nodes
    .append("image")
    .attr("x", (d) => cx(d) - r(d))
    .attr("y", (d) => cy(d) - r(d))
    .attr("width", (d) => z(d.population))
    .attr("height", (d) => z(d.population))
    .attr("preserveAspectRatio", "xMidYMid slice")
    .attr("href", (d) => coverUrl(base, era.id, d.id))
    .attr("clip-path", (d) => `url(#${clipId(d)})`);

  nodes
    .append("circle")
    .attr("class", "circle-border")
    .attr("cx", cx)
    .attr("cy", cy)
    .attr("r", r);

  const positionTooltip = (e: MouseEvent) => {
    const node = tooltip.node() as HTMLElement;
    const offset = 20;

    let left = e.pageX + offset;
    if (left + node.offsetWidth > window.scrollX + window.innerWidth - offset) {
      left = e.pageX - node.offsetWidth - offset;
    }
    let top = e.pageY + offset;
    if (top + node.offsetHeight > window.scrollY + window.innerHeight - offset) {
      top = e.pageY - node.offsetHeight - offset;
    }
    tooltip
      .style("left", `${Math.max(offset, left)}px`)
      .style("top", `${Math.max(offset, top)}px`);
  };

  const showTooltip = function (this: SVGGElement, e: MouseEvent, d: Comic) {
    nodes.classed("dimmed", true);
    d3.select(this).classed("dimmed", false).classed("active", true).raise();

    const rows: Array<[string, string]> = [
      ["Title:", d.title],
      ["Average Grade:", String(d.average)]
    ];
    if (d.top50Average !== undefined) {
      rows.push(["Top 50 Copies Average Grade:", String(d.top50Average)]);
    }
    if (d.pop9Plus !== undefined) rows.push(["9.0+ Copies:", formatCount(d.pop9Plus)]);
    rows.push(
      ["Population:", formatCount(d.population)],
      ["Rank:", String(d.rank)],
      ["Value (OSPG):", formatMoney(d.value)],
      ["Date:", formatDate(d.date)]
    );

    const dl = document.createElement("dl");
    for (const [term, desc] of rows) {
      const dt = document.createElement("dt");
      dt.textContent = term;
      const dd = document.createElement("dd");
      dd.textContent = desc;
      dl.append(dt, dd);
    }
    // Populate before measuring so offsetWidth/offsetHeight are accurate
    (tooltip.node() as HTMLElement).replaceChildren(dl);
    tooltip.style("display", "block");
    positionTooltip(e);
  };

  const hideTooltip = () => {
    nodes
      .classed("dimmed", false)
      .classed("active", false)
      .sort((a, b) => b.population - a.population); // restore smallest-on-top z-order
    tooltip.style("display", "none");
  };

  nodes.on("mouseover", showTooltip).on("mousemove", positionTooltip).on("mouseleave", hideTooltip);

  svg
    .append("text")
    .attr("class", "label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.top + 30)
    .text("Date of Release");

  svg
    .append("text")
    .attr("class", "label")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -margin.top)
    .text(metricLabels(dataset, metric));
}
