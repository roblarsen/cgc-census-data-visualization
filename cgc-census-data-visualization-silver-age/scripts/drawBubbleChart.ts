import * as d3 from "d3";
import * as _ from "lodash";
import { Comic } from "./Comic";

export function drawBubbleChart(data: Comic[]) {
  const years: number[] = [];
  data.forEach((d: Comic) => {
    const mdy = d.date.split("/");
    years.push(Number(mdy[2]));
  });

  data = _.orderBy(data, ["population"], ["desc"]);

  const maxPop = _.maxBy(data, "population").population;
  const maxGrade = Math.min(_.maxBy(data, "top50Average").top50Average + 0.35, 10);
  const minGrade = _.minBy(data, "top50Average").top50Average - 0.5;
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years) + 1;

  const canvas = {
    width: document.body.offsetWidth,
    height: document.body.offsetHeight * 0.9
  };

  const ratio = 0.55;

  const margin = { top: 10, right: 50, bottom: 60, left: 60 },
    width = canvas.width - margin.left - margin.right,
    height = canvas.width * ratio - margin.top - margin.bottom;

  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const tooltip = d3
    .select("#chart")
    .append("div")
    .style("display", "none")
    .attr("class", "tooltip");

  const x = d3.scaleTime(
    [new Date(minYear, 0, 1), new Date(maxYear, 0, 1)],
    [0, width]
  );

  const y = d3.scaleLinear().domain([minGrade, maxGrade]).range([height, 0]);

  const yGrid = d3
    .axisLeft(y)
    .tickFormat(() => "")
    .ticks(5)
    .tickSizeInner(-width);

  svg.append("g").call(yGrid);

  const xGrid = d3
    .axisBottom(x)
    .tickFormat(() => "")
    .ticks(5)
    .tickSizeInner(-height);

  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xGrid);

  svg.append("g").call(d3.axisLeft(y));

  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Use scaleSqrt so area scales proportionally to population,
  // and cap max diameter at 110px so DD #1 / X-Men #1 don't swallow 1962-1963
  const z = d3
    .scaleSqrt()
    .domain([0, maxPop])
    .range([24, 110]);

  // Define clipPaths first
  svg
    .append("defs")
    .selectAll("clipPath")
    .data(data)
    .enter()
    .append("clipPath")
    .attr("id", (d: Comic) => d.id)
    .append("circle")
    .attr("cx", (d: Comic) => x(new Date(d.date)))
    .attr("cy", (d: Comic) => y(d.top50Average))
    .attr("r", (d: Comic) => z(d.population) / 2);

  // Create a <g class="comic-node"> wrapper for each book so:
  // 1) filter: drop-shadow() on the <g> isn't clipped by the image's clip-path
  // 2) we can render a crisp <circle class="circle-border"> around each clipped image
  const nodes = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("g.comic-node")
    .data(data.sort((a, b) => b.population - a.population))
    .enter()
    .append("g")
    .attr("class", "comic-node")
    .attr("id", (d: Comic) => `node-${d.id}`);

  nodes
    .append("image")
    .attr("x", (d: Comic) => x(new Date(d.date)) - z(d.population) / 2)
    .attr("y", (d: Comic) => y(d.top50Average) - z(d.population) / 2)
    .attr("width", (d: Comic) => z(d.population))
    .attr("height", (d: Comic) => z(d.population))
    .attr("preserveAspectRatio", "xMidYMid slice") // fills circle completely
    .attr("href", (d: Comic) => `./img/${d.id}.jpg`)
    .attr("clip-path", (d: Comic) => `url(#${d.id})`);

  // Visible border ring around each cover to separate overlapping Marvel books
  nodes
    .append("circle")
    .attr("class", "circle-border")
    .attr("cx", (d: Comic) => x(new Date(d.date)))
    .attr("cy", (d: Comic) => y(d.top50Average))
    .attr("r", (d: Comic) => z(d.population) / 2);

 const positionTooltip = (e: MouseEvent) => {
    const node = tooltip.node() as HTMLElement;
    const tooltipWidth = node.offsetWidth;
    const tooltipHeight = node.offsetHeight;
    const offset = 20;

    // Flip to the left of the cursor if it overflows the right viewport edge
    let left = e.pageX + offset;
    if (left + tooltipWidth > window.scrollX + window.innerWidth - offset) {
      left = e.pageX - tooltipWidth - offset;
    }

    // Flip above the cursor if it overflows the bottom viewport edge
    let top = e.pageY + offset;
    if (top + tooltipHeight > window.scrollY + window.innerHeight - offset) {
      top = e.pageY - tooltipHeight - offset;
    }

    tooltip
      .style("left", `${Math.max(offset, left)}px`)
      .style("top", `${Math.max(offset, top)}px`);
  };

  const showTooltip = function (this: SVGGElement, e: MouseEvent, d: Comic) {
    nodes.classed("dimmed", true);
    d3.select(this).classed("dimmed", false).classed("active", true).raise();

    const text = `
      <dl>
        <dt>Title:</dt>
        <dd>${d.title}</dd>
        <dt>Average Grade:</dt>
        <dd>${d.average}</dd>
        <dt>Top 50 Copies Average Grade:</dt>
        <dd>${d.top50Average}</dd>
        <dt>9.0+ Copies:</dt>
        <dd>${d.pop9Plus}</dd>
        <dt>Population:</dt>
        <dd>${d3.format(",")(d.population)}</dd>
        <dt>Rank:</dt>
        <dd>${d.rank}</dd>
        <dt>Value (OSPG):</dt>
        <dd>${d3.format("$,")(d.value)}</dd>
        <dt>Date:</dt>
        <dd>${d.date}</dd>
      </dl>
    `;

    // Render block and populate HTML first so offsetWidth/offsetHeight are accurate
    tooltip.style("display", "block").html(text);
    positionTooltip(e);
  };

  const moveTooltip = (e: MouseEvent) => {
    positionTooltip(e);
  };
  const hideTooltip = () => {
    nodes
      .classed("dimmed", false)
      .classed("active", false)
      .sort((a: Comic, b: Comic) => b.population - a.population); // restore smallest-on-top Z-order
    tooltip.style("display", "none");
  };

  nodes
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseleave", hideTooltip);

  // Add X axis label:
  svg
    .append("text")
    .attr("class", "label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.top + 30)
    .text("Date of Release");

  // Y axis label:
  svg
    .append("text")
    .attr("class", "label")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -margin.top)
    .text("Top 50 Average Grade");
}