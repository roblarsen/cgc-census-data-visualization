export class Comic {
    title: string;
    date: string;
    average: number;
    top50Average:number;
    population: number;
    id: string;
    value: number;
    link: string;
    rank: number;
  
    constructor(
      title: string,
      date: string,
      average: number,
      top50Average:number,
      population: number,
      id: string,
      value: number,
      link: string,
      rank: number
    ) {
      this.title = title;
      this.date = date;
      this.average = average;
      this.top50Average = top50Average;
      this.population = population;
      this.id = id;
      this.value = value;
      this.link = link;
      this.rank = rank;
    }
  }