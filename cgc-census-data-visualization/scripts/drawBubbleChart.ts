import * as d3 from "d3";
import * as _ from "lodash";
import { Comic } from "./Comic";

export function drawBubbleChart(data: Comic[]) {
  const years = [];
  data.forEach((d: Comic) => {
    const mdy = d.date.split("/");
    years.push(mdy[2]);
  });

  data = _.orderBy(data, ["population"], ["desc"]);

  const maxPop = _.maxBy(data, "population").population;
  const maxGrade = _.maxBy(data, "average").average + 1;
  const minGrade = _.minBy(data, "average").average - 1;
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years) + 1;


  const canvas = { width: document.body.offsetWidth, height: document.body.offsetHeight * .9 };

  const ratio = .55;


  const margin = { top: 10, right: 50, bottom: 60, left: 60 }, width = canvas.width - margin.left - margin.right, height = (canvas.width * ratio) - margin.top - margin.bottom;

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

  const showTooltip = (e: MouseEvent) => {
    const text = `
  <dl>
    <dt>Title:</dt>
    <dd>${d3.select(e.target).datum().title}</dd>
    <dt>Average Grade:</dt>
    <dd> ${d3.select(e.target).datum().average}</dd>
    <dt>Population:</dt>
    <dd> ${d3.select(e.target).datum().population}</dd>
    <dt>Rank:</dt>
    <dd> ${d3.select(e.target).datum().rank}</dd>
    <dt>Value (OSPG):</dt>
    <dd> ${d3.format("$,")(d3.select(e.target).datum().value)}</dd>
    <dt>Date:</dt>
    <dd>${d3.select(e.target).datum().date}</dd>
</dl>
  `;
    tooltip
      .style("display", "block")
      .html(text)
      .style("left", d3.pointer(e)[0] + 30 + "px")
      .style("top", d3.pointer(e)[1] + 30 + "px");
  };
  const moveTooltip = (e: MouseEvent) => {

    tooltip
      .style("left", `${d3.pointer(e)[0] + 60}px`)
      .style("top", d3.pointer(e)[1] + 30 + "px");
  };
  const hideTooltip = () => {
    tooltip.style("display", "none");
  };

  const x = d3.scaleTime(
    [new Date(minYear, 0, 1), new Date(maxYear, 5, 30)],
    [0, width]
  );

  svg.append("g").attr("transform", "translate(0," + height + ")");

  const y = d3.scaleLinear().domain([minGrade, maxGrade]).range([height, 0]);
  const yGrid = d3
    .axisLeft()
    .scale(y)
    .tickFormat("")
    .ticks(5)
    .tickSizeInner(-width);

  svg.append("g").call(yGrid);
  const xGrid = d3
    .axisBottom()
    .scale(x)
    .tickFormat("")
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

  const z = d3
    .scaleLinear()
    .domain([0, maxPop])
    .range([maxPop * 0.1, maxPop * 0.75]);

  svg
    .append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("image")
    .attr("x", (d: Comic) => {
      return x(new Date(d.date)) - z(d.population) / 2;
    })
    .attr("y", (d: Comic) => {
      return y(d.average) - z(d.population) / 2;
    })
    .attr("width", (d: Comic) => {
      return z(d.population);
    })
    .attr("height", (d: Comic) => {
      return z(d.population);
    })
    .attr("class", "circle")
    .attr("href", (d: Comic) => {
      return "./img/" + d.id + ".jpg";
    })
    .attr("clip-path", (d: Comic) => {
      return `url(#${d.id})`;
    })
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseleave", hideTooltip);
  // Add X axis label:
  svg.append("text")
    .attr("class", "label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.top + 30)
    .text("Date of Release");

  // Y axis label:
  svg.append("text")
    .attr("class", "label")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -margin.top)
    .text("Average Grade");

  svg
    .append("defs")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("clipPath")
    .attr("id", (d: Comic) => {
      return d.id;
    })
    .append("circle")
    .attr("cx", (d: Comic) => {
      return x(new Date(d.date));
    })
    .attr("cy", (d: Comic) => {
      return y(d.average);
    })
    .attr("r", (d: Comic) => {
      return z(d.population) / 2;
    });

}
