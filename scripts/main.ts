import * as d3 from "d3";
import * as _ from "lodash";

const data = [
  {
    title: "Action Comics #1",
    date: "04/18/1938",
    average: 4.18,
    population: 44,
    id: "action-comics-1"
  },
  {
    title: "Detective Comics #27",
    date: "03/30/1939",
    average: 4.59,
    population: 38,
    id: "detective-comics-27"
  },
  {
    title: "Superman #1",
    date: "05/18/1939",
    average: 2.51,
    population: 78,
    id: "superman-1"
  },
  {
    title: "Marvel Comics #1",
    date: "09/31/1939",
    average: 4.27,
    population: 37,
    id: "marvel-comics-1"
  },
  {
    title: "Batman #1",
    date: "04/25/1940",
    average: 3.2,
    population: 153,
    id: "batman-1"
  },
  {
    title: "All American Comics #16",
    date: "05/17/1940",
    average: 4.1,
    population: 33,
    id: "all-american-comics-16"
  },
  {
    title: "Captain America Comics #1",
    date: "12/20/1940",
    average: 5.1,
    population: 97,
    id: "captain-america-comics-1"
  },
  {
    title: "Action Comics #7",
    date: "10/25/1938",
    average: 3.28,
    population: 33,
    id: "action-comics-7"
  },
  {
    title: "Detective Comics #31",
    date: "07/30/1939",
    average: 2.97,
    population: 66,
    id: "detective-comics-31"
  },
  {
    title: "Whiz Comics #2 (#1)",
    date: "11/08/1939",
    average: 3.31,
    population: 33,
    id: "whiz-2"
  }
  /*
  Pep 22
  Action Comics 10
  Flash Comics 1
  Detective Comics 29
  All Star Comics 8
  More Fun Comics 52
  Action Comics 2
  Detective Comics 33
  Wonder Woman
  Sensation Comics
  */
];
const years = [];
data.forEach((a) => {
  const mdy = a.date.split("/");
  years.push(mdy[2]);
});

const maxPop = _.maxBy(data, "population").population;
const maxGrade = _.maxBy(data, "average").average + 1;
const minYear = Math.min(...years);
const maxYear = Math.max(...years) + 1;

const margin = { top: 10, right: 20, bottom: 30, left: 50 },
  width = 1024 - margin.left - margin.right,
  height = 660 - margin.top - margin.bottom;

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
  .style("opacity", 0)
  .attr("class", "tooltip");

const showTooltip = function (d) {
  const text = `
    <p>Title: ${d3.select(d.srcElement).datum().title}</p>
    <p>Date: ${d3.select(d.srcElement).datum().date}</p>
    <p>Average Grade: ${d3.select(d.srcElement).datum().average}</p>
    <p>Population: ${d3.select(d.srcElement).datum().population}</p>
  `;
  tooltip
    .style("opacity", 1)
    .html(text)
    .style("left", d3.pointer(event)[0] + 30 + "px")
    .style("top", d3.pointer(event)[1] + 30 + "px");
};
const moveTooltip = function (d) {
  console.log(d3.pointer(event));
  tooltip
    .style("left", d3.pointer(event)[0] + 30 + "px")
    .style("top", d3.pointer(event)[1] + 30 + "px");
};
const hideTooltip = function (d) {
  tooltip.style("opacity", 0);
};

const x = d3.scaleTime(
  [new Date(minYear, 0, 1), new Date(maxYear, 5, 30)],
  [0, width]
);

svg.append("g").attr("transform", "translate(0," + height + ")");

const y = d3.scaleLinear().domain([0, maxGrade]).range([height, 0]);

svg.append("g").call(d3.axisLeft(y));

svg
  .append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

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

const z = d3.scaleLinear().domain([0, maxPop]).range([0, maxPop]);

svg
  .append("g")
  .selectAll("dot")
  .data(data)
  .enter()
  .append("image")
  .attr("x", function (d) {
    return x(new Date(d.date)) - z(d.population) / 2;
  })
  .attr("y", function (d) {
    return y(d.average) - z(d.population) / 2;
  })
  .attr("width", function (d) {
    return z(d.population);
  })
  .attr("height", function (d) {
    return z(d.population);
  })
  .attr("class", "circle")
  .attr("href", function (d) {
    return "/img/" + d.id + ".jpg";
  })
  .attr("clip-path", function (d) {
    return `url(#${d.id})`;
  })
  .on("mouseover", showTooltip)
  .on("mousemove", moveTooltip)
  .on("mouseleave", hideTooltip);

svg
  .append("defs")
  .selectAll("dot")
  .data(data)
  .enter()
  .append("clipPath")
  .attr("id", function (d) {
    return d.id;
  })
  .append("circle")
  .attr("cx", function (d) {
    return x(new Date(d.date));
  })
  .attr("cy", function (d) {
    return y(d.average);
  })
  .attr("r", function (d) {
    return z(d.population) / 2;
  });
