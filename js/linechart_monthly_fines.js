function drawFinesChart() {
  d3.csv("./data/police_enforcement_speeding_2023.csv").then(finesData => {
    const monthMap = {
      "Jan": "Jan", "Feb": "Feb", "Mar": "Mar", "Apr": "Apr", "May": "May", "June": "Jun", "July": "Jul",
      "Aug": "Aug", "Sept": "Sep", "Sep": "Sep", "Oct": "Oct", "Nov": "Nov", "Dec": "Dec"
    };

    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Parse and normalize
    finesData.forEach(d => {
      const date = new Date(d.START_DATE);
      const rawMonth = date.toLocaleString('default', { month: 'short' });
      d.Month = monthMap[rawMonth] || rawMonth;
      d.FINES = +d.FINES;
      d.JURISDICTION = d.JURISDICTION?.trim().toUpperCase();
    });

    const qldRows = finesData.filter(d => d.JURISDICTION === "QLD");
    const qldTotalFines = d3.sum(qldRows, d => d.FINES);
    const qldMonthlyAverage = Math.round(qldTotalFines / 12);
    const nonQLDData = finesData.filter(d => d.JURISDICTION !== "QLD");

    const qldAveragedData = monthOrder.map(month => ({
      Month: month,
      FINES: qldMonthlyAverage
    }));

    const adjustedData = nonQLDData.concat(qldAveragedData);

    const finesByMonth = d3.rollup(
      adjustedData,
      v => d3.sum(v, d => d.FINES),
      d => d.Month
    );

    const data = monthOrder.map(month => ({
      month: month,
      fines: finesByMonth.get(month) || 0
    }));

    // Clean previous chart
    d3.select("#line-chart-monthly-fines").select("svg").remove();
    d3.select("#line-chart-monthly-fines").select(".tooltip-linechart").remove();

    // Responsive width based on container
    const container = document.getElementById("line-chart-monthly-fines");
    const containerWidth = container.getBoundingClientRect().width;

    const margin = { top: 50, right: 30, bottom: 50, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#line-chart-monthly-fines")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
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
      .attr("stroke", "#FCA311")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.month))
      .attr("cy", d => y(d.fines))
      .attr("r", 5)
      .attr("fill", "#FCA311")
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
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  drawFinesChart();

  const wrapper = document.getElementById("chart-wrapper");
  const buttons = document.querySelectorAll("#toggle-buttons button");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      wrapper.classList.remove("fines", "fatal", "both");
      wrapper.classList.add(view);
      drawFinesChart();
    });
  });

  // Optional: redraw on resize
  window.addEventListener("resize", () => {
    drawFinesChart();
  });
});
