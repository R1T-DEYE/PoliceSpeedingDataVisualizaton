function drawSpeedLimitFatalities(mode = "2023") 
{
  d3.csv("./data/cleaned_up_fatal_crashes_ALL_YEARS.csv").then(data => {
    // Clean and filter based on mode
    let filtered = data.filter(d => !isNaN(+d.Speed_Limit) && +d.Speed_Limit > 0);

    if (mode === "2023" || mode === "granular") {
      filtered = filtered.filter(d => +d.Year === 2023);
    }

    // Remove previous chart
    d3.select("#section-speed-limit-fatalities").select("svg").remove();

    // Responsive width
    const container = document.getElementById("section-speed-limit-fatalities");
    const containerWidth = Math.max(container.getBoundingClientRect().width, 350); // Min width 350px

    const margin = { top: 50, right: 30, bottom: 50, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#section-speed-limit-fatalities")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    let grouped;

    // Chart rendering logic (inside drawSpeedLimitFatalities)
if (mode === "granular") {
  const counts = d3.rollup(
    filtered,
    v => v.length,
    d => +d.Speed_Limit
  );

  grouped = Array.from(counts, ([speed, count]) => ({
    label: `${speed} km/h`,
    value: +speed,
    count
  }))
  .sort((a, b) => a.value - b.value);
} else {
  const bins = [
    { label: "0–20 km/h", min: 0, max: 20 },
    { label: "21–40 km/h", min: 21, max: 40 },
    { label: "41–60 km/h", min: 41, max: 60 },
    { label: "61–80 km/h", min: 61, max: 80 },
    { label: "81–100 km/h", min: 81, max: 100 },
    { label: "100+ km/h", min: 101, max: Infinity }
  ];

  grouped = bins.map(bin => ({
    label: bin.label,
    count: filtered.filter(d => {
      const speed = +d.Speed_Limit;
      return speed >= bin.min && speed <= bin.max;
    }).length
  }));
}

const x = d3.scaleBand()
  .domain(grouped.map(d => d.label))
  .range([0, width])
  .padding(0.2);

const y = d3.scaleLinear()
  .domain([0, d3.max(grouped, d => d.count)]).nice()
  .range([height, 0]);

svg.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(x))
  .selectAll("text")
  .style("font-size", "12px")
  .attr("text-anchor", "middle"); // center-align

svg.append("g")
  .call(d3.axisLeft(y));


    svg.selectAll(".bar")
      .data(grouped)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.label))
      .attr("y", d => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.count))
      .attr("fill", "#022457");

    svg.selectAll(".bar-label")
      .data(grouped)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", d => x(d.label) + x.bandwidth() / 2)
      .attr("y", d => y(d.count) - 6)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#333")
      .text(d => d.count);

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Fatal Crashes by Speed Limit");
  });
}

// Filter button interaction
document.addEventListener("DOMContentLoaded", () => {
  drawSpeedLimitFatalities(); // default mode: 2023

const buttonsHTML = `
  <div id="speed-limit-buttons" style="margin-bottom: 20px;">
    <button type="button" data-mode="2023" class="active">2023</button>
    <button type="button" data-mode="all">1989 - 2025</button>
    <button type="button" data-mode="granular">2023 Granular</button>
  </div>
`;

  const container = document.getElementById("section-speed-limit-fatalities");
  container.insertAdjacentHTML("afterbegin", buttonsHTML);

  const buttons = document.querySelectorAll("#speed-limit-buttons button");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
    const scrollY = window.scrollY;

    buttons.forEach(b => b.classList.remove("active"));
    button.classList.add("active");

    // Slight delay allows DOM update (chart removal/insertion) to happen first
    setTimeout(() => {
        drawSpeedLimitFatalities(button.getAttribute("data-mode"));

        // Delay ensures Firefox restores position after DOM redraw
        requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY, behavior: "auto" });
        });
    }, 0);
    });

  });

  window.addEventListener("resize", () => {
    const active = document.querySelector("#speed-limit-buttons button.active");
    drawSpeedLimitFatalities(active?.getAttribute("data-mode") || "2023");
  });
});
