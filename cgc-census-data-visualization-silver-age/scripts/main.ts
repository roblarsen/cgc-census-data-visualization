import * as d3 from "d3";
import { Comic } from "./Comic";
import { drawBubbleChart } from "./drawBubbleChart";
import { drawTable } from "./drawTable";

let data: Comic[] = [];

d3.json("data/data.json")
  .then((d) => {
    data = d.comics;
    drawBubbleChart(data);
    drawTable(data);
  })
  .catch((err) => {
  console.error("Error loading data:", err)});

