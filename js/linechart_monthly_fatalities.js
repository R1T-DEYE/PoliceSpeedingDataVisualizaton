function drawFatalChart() {
  d3.csv("./data/cleaned_up_crash_by_date.csv").then(fatalData => {
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

    // Clean previous chart and tooltip
    d3.select("#line-chart-monthly-fatal").select("svg").remove();
    d3.select("#line-chart-monthly-fatal").select(".tooltip-linechart").remove();

    // Detect layout mode
    const wrapper = document.getElementById("chart-wrapper");
    const isBoth = wrapper.classList.contains("both");

const container = document.getElementById("line-chart-monthly-fatal");
const containerWidth = container.getBoundingClientRect().width;

const margin = { top: 50, right: 30, bottom: 50, left: 60 };
const minWidth = 350;
const effectiveWidth = Math.max(containerWidth, minWidth);
const width = effectiveWidth - margin.left - (margin.right * 0.1);
const height = 400 - margin.top - margin.bottom;


    const svg = d3.select("#line-chart-monthly-fatal")
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

    const tooltip = d3.select("#line-chart-monthly-fatal")
      .append("div")
      .attr("class", "tooltip-linechart");

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#022C5E")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.month))
      .attr("cy", d => y(d.fatalities))
      .attr("r", 5)
      .attr("fill", "#022C5E")
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.month}</strong><br>Fatalities: ${d.fatalities}`);
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
      .text("Monthly Fatal Crashes");
  });
}
