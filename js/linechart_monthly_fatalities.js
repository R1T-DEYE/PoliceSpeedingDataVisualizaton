document.addEventListener("DOMContentLoaded", () => {
  d3.csv("../data/cleaned_up_crash_by_date.csv").then(fatalData => {
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const fatalByMonth = d3.rollup(
      fatalData,
      v => d3.sum(v, d => +d.Num_FatalCrashes),
      d => d.Month
    );

    const data = monthOrder.map(month => ({
      month: month,
      fatalities: fatalByMonth.get(month) || 0
    }));

    const margin = { top: 50, right: 30, bottom: 50, left: 60 },
          width = 450 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#line-chart-monthly-fatal")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint()
      .domain(monthOrder)
      .range([0, width])
      .padding(0.5);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.fatalities)]).nice()
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));

    const line = d3.line()
      .x(d => x(d.month))
      .y(d => y(d.fatalities));

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Monthly Fatal Crashes");
  });
});
