import * as d3 from "d3";
import * as _ from "lodash";

type Comic = {
  title: string;
  date: string;
  average: number;
  population: number;
  id: string;
  link?: string;
};
let data: Comic[] = [
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
  },
  {
    title: "Pep Comics #22",
    date: "11/30/1941",
    average: 3.24,
    population: 21,
    id: "pep-comics-22",
    link: "http://www.cgcdata.com/cgc/search/isolateid/18236"
  },
  {
    title: "Action Comics #10",
    population: 23,
    average: 3.26,
    id: "action-comics-10",
    date: "3/10/1939",
    link: "http://www.cgcdata.com/cgc/search/isolateid/6593"
  },

  {
    title: "Flash Comics #1",
    link: "http://www.cgcdata.com/cgc/search/isolateid/3343",
    population: 49,
    average: 4.21,
    id: "flash-comics-1",
    date: "11/20/1939"
  },
  {
    title: "Detective Comics #29",
    link: "http://www.cgcdata.com/cgc/search/isolateid/3373",
    population: 42,
    average: 4.44,
    id: "detective-comics-29",
    date: "5/31/1939"
  },
  {
    title: "All Star Comics #8",
    link: "http://www.cgcdata.com/cgc/search/isolateid/663",
    id: "all-star-comics-8",
    population: 154,
    average: 3.79,
    date: "10/21/1941"
  },
  {
    title: "More Fun Comics #52",
    id: "more-fun-comics-52",
    link: "http://www.cgcdata.com/cgc/search/isolateid/1762",
    population: 22,
    average: 4.49,
    date: "2/10/1940"
  },
  {
    title: "Action Comics #2",
    id: "action-comics-2",
    link: "http://www.cgcdata.com/cgc/search/isolateid/8502",
    population: 24,
    average: 4.08,
    date: "6/20/1938"
  },
  {
    title: "Detective Comics #33",
    id: "detective-comics-33",
    link: "http://www.cgcdata.com/cgc/search/isolateid/292",
    population: 68,
    average: 3.72,
    date: "11/10/1939"
  },
  {
    title: "Wonder Woman #1",
    id: "wonder-woman-1",
    link: "http://www.cgcdata.com/cgc/search/isolateid/5894",
    population: 135,
    average: 4.47,
    date: "7/10/1942"
  },
  {
    title: "Sensation Comics #1",
    id: "sensation-comics-1",
    link: "http://www.cgcdata.com/cgc/search/isolateid/662",
    population: 82,
    average: 4.78,
    date: "3/24/1942"
  }
];
const years = [];
data.forEach((a) => {
  const mdy = a.date.split("/");
  years.push(mdy[2]);
});

data = _.orderBy(data, ["population"], ["desc"]);
console.log(data);
const maxPop = _.maxBy(data, "population").population;
const maxGrade = _.maxBy(data, "average").average + 1;
const minGrade = _.minBy(data, "average").average - 1;
const minYear = Math.min(...years);
const maxYear = Math.max(...years) + 1;

const margin = { top: 10, right: 20, bottom: 30, left: 50 },
  width = 1440 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;

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

const showTooltip = (e:MouseEvent)=> {
  const text = `
    <p>Title: ${d3.select(e.srcElement).datum().title}</p>
    <p>Date: ${d3.select(e.srcElement).datum().date}</p>
    <p>Average Grade: ${d3.select(e.srcElement).datum().average}</p>
    <p>Population: ${d3.select(e.srcElement).datum().population}</p>
  `;
  tooltip
    .style("opacity", 1)
    .html(text)
    .style("left", d3.pointer(event)[0] + 30 + "px")
    .style("top", d3.pointer(event)[1] + 30 + "px");
};
const moveTooltip = (e:MouseEvent)=> {
  tooltip
    .style("left", d3.pointer(event)[0] + 30 + "px")
    .style("top", d3.pointer(event)[1] + 30 + "px");
};
const hideTooltip = (e:MouseEvent)=> {
  tooltip.style("opacity", 0);
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
  .attr("x", (d:Comic)=> {
    return x(new Date(d.date)) - z(d.population) / 2;
  })
  .attr("y", (d:Comic)=> {
    return y(d.average) - z(d.population) / 2;
  })
  .attr("width", (d:Comic)=> {
    return z(d.population);
  })
  .attr("height", (d:Comic)=> {
    return z(d.population);
  })
  .attr("class", "circle")
  .attr("href", (d:Comic)=> {
    return "/img/" + d.id + ".jpg";
  })
  .attr("clip-path", (d:Comic)=> {
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
  .attr("id", (d:Comic)=> {
    return d.id;
  })
  .append("circle")
  .attr("cx", (d:Comic)=> {
    return x(new Date(d.date));
  })
  .attr("cy", (d:Comic)=> {
    return y(d.average);
  })
  .attr("r", (d:Comic)=> {
    return z(d.population) / 2;
  });
