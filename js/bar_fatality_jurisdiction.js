function drawFatalityJurisdiction(mode = "raw") {
  Promise.all([
    d3.csv("./data/cleaned_up_fatal_crashes.csv", d => {
      d.Year = +d.Year;
      d.Num_Fatalities = +d.Num_Fatalities;
      d.State = d.State.trim().toUpperCase();
      return d;
    }),
    d3.csv("./data/police_enforcement_speeding_2023.csv", d => {
      d.FINES = +d.FINES;
      d.JURISDICTION = d.JURISDICTION.trim().toUpperCase();
      return d;
    })
  ]).then(([fatalData, finesData]) => {
    const containerId = "#section-jurisdiction-fatality";
    d3.select(containerId).select("svg").remove();

    // Filter to just 2023
    const filteredFatal = fatalData.filter(d => d.Year === 2023);
    const filteredFines = finesData.filter(d => d.YEAR === "2023");

    // === Aggregate data ===
    const fatalByState = d3.rollup(
      filteredFatal,
      v => d3.sum(v, d => d.Num_Fatalities),
      d => d.State
    );

    const finesByJurisdiction = d3.rollup(
      filteredFines,
      v => d3.sum(v, d => d.FINES),
      d => d.JURISDICTION
    );

    const allJurisdictions = Array.from(new Set([
      ...fatalByState.keys(),
      ...finesByJurisdiction.keys()
    ])).sort();

    const data = allJurisdictions.map(jur => ({
      state: jur,
      fatalities: fatalByState.get(jur) || 0,
      fines: finesByJurisdiction.get(jur) || 0
    }));

    const container = document.querySelector(containerId);
    const containerWidth = Math.max(container.getBoundingClientRect().width, 360);

    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(containerId)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x0 = d3.scaleBand()
      .domain(data.map(d => d.state))
      .range([0, width])
      .padding(mode === "compare" ? 0.2 : 0.3);

    const x1 = d3.scaleBand()
      .domain(["fatalities", "fines"])
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear()
      .range([height, 0]);

    if (mode === "compare") {
      const maxY = d3.max(data, d => Math.max(d.fatalities, d.fines));
      y.domain([0, maxY]).nice();
    } else {
      y.domain([0, d3.max(data, d => d.fatalities)]).nice();
    }

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .style("font-size", "12px")
      .attr("text-anchor", "middle");

    svg.append("g")
      .call(d3.axisLeft(y));

    if (mode === "compare") {
  svg.selectAll("g.bar-group")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "bar-group")
    .attr("transform", d => `translate(${x0(d.state)},0)`)
    .selectAll("rect")
    .data(d => [
      { key: "fatalities", value: d.fatalities },
      { key: "fines", value: d.fines }
    ])
    .enter()
    .append("rect")
    .attr("x", d => x1(d.key) + (x0.bandwidth() - x1.bandwidth() * 4) / 2)
    .attr("y", d => y(d.value))
    .attr("width", x1.bandwidth()*1.75)
    .attr("height", d => height - y(d.value))
    .attr("fill", d => d.key === "fatalities" ? "#d73027" : "#022457");
    
    svg.selectAll(".bar-label")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => x0(d.state) + x0.bandwidth() / 2)
        .attr("y", d => y(d.fines) - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text(d => d.fines);
    
}
 else {
      svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x0(d.state))
        .attr("y", d => y(d.fatalities))
        .attr("width", x0.bandwidth())
        .attr("height", d => height - y(d.fatalities))
        .attr("fill", "#022457");

      svg.selectAll(".bar-label")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => x0(d.state) + x0.bandwidth() / 2)
        .attr("y", d => y(d.fatalities) - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text(d => d.fatalities);
    }

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(mode === "compare" ? "Speed fines by Jurisdiction 2023" : "Fatalities by Jurisdiction 2023");
  });
}

// === Button setup
document.addEventListener("DOMContentLoaded", () => {
  drawFatalityJurisdiction(); // default: raw

  const menuHTML = `
    <div id="jurisdiction-toggle" style="margin-bottom: 15px;">
      <button data-mode="raw" class="active">Fatalities</button>
      <button data-mode="compare">Fines</button>
    </div>
  `;
  const container = document.getElementById("section-jurisdiction-fatality");
  container.insertAdjacentHTML("afterbegin", menuHTML);

  const buttons = document.querySelectorAll("#jurisdiction-toggle button");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      drawFatalityJurisdiction(btn.getAttribute("data-mode"));
    });
  });

  window.addEventListener("resize", () => {
    const active = document.querySelector("#jurisdiction-toggle button.active");
    drawFatalityJurisdiction(active?.getAttribute("data-mode") || "raw");
  });
});
