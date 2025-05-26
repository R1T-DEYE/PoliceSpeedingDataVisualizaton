

document.addEventListener("DOMContentLoaded", () => {
  d3.csv("./data/police_enforcement_speeding_2023.csv").then(finesData => {
    console.log(window.location.href);
    console.log("Trying to fetch:", new URL("../data/police_enforcement_speeding_2023.csv", window.location.href).href);


    const monthMap = {
      "Jan": "Jan", "Feb": "Feb", "Mar": "Mar", "Apr": "Apr", "May": "May", "June": "Jun", "July": "Jul", "Aug": "Aug", "Sept": "Sep", "Sep": "Sep",
      "Oct": "Oct", "Nov": "Nov", "Dec": "Dec"
    };

    finesData.forEach(d => {
      const date = new Date(d.START_DATE);
      const rawMonth = date.toLocaleString('default', { month: 'short' });
      d.Month = monthMap[rawMonth] || rawMonth;
      d.FINES = +d.FINES;
    });

    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const finesByMonth = d3.rollup(
      finesData,
      v => d3.sum(v, d => d.FINES),
      d => d.Month
    );

    const data = monthOrder.map(month => ({
      month: month,
      fines: finesByMonth.get(month) || 0
    }));

    const margin = { top: 50, right: 30, bottom: 50, left: 60 },
          width = 450 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#line-chart-monthly-fines")
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
      .domain([0, d3.max(data, d => d.fines)]).nice()
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));

    const line = d3.line()
      .x(d => x(d.month))
      .y(d => y(d.fines));

      const tooltip = d3.select("#line-chart-monthly-fines")
  .append("div")
  .attr("class", "tooltip-linechart");


    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 2.5)
      .attr("d", line);


    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.month))
      .attr("cy", d => y(d.fines))
      .attr("r", 5)
      .attr("fill", "orange")
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.month}</strong><br>Fines: ${d.fines.toLocaleString()}`);
      })
      .on("mousemove", event => {
        tooltip
          .style("left", (event.clientX - 595) + "px")
          .style("top", (event.clientY - 200) + "px");
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", 0);
      });

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Monthly Speeding Fines");
  });



});
