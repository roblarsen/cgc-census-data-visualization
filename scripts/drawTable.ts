import * as d3 from "d3";
import * as _ from "lodash";
import { Comic } from "./Comic";

export function drawTable(data: Comic[]) {
 
  d3
    .select("#table")
    .append("table")
    .append("thead")
    .append("tr")
    .html(() => {
      const th =
        `
        <th>Title</th>
        <th>Value (OSPG)</th>
        <th>Date</th>
        `
      return th;
    });

  d3.select("#table table")
    .data(data)
    .enter()
    .append("tr")
    .html((d:Comic)=> {
     const td =
     `
    <td>${d.title}</td>
    <td> ${d.value}</td>
    <td>${d.date}</td>
    `
      return td;
    }) 
    
}
