function drawSpeedFinesLineChart() {
  d3.csv("./data/speeding_2008_2023.csv").then(data => {
    data.forEach(d => {
      d.year = +d.year;
      d.speed_infringements_police = +d.speed_infringements_police || 0;
      d.speed_infringements_cameras = +d.speed_infringements_cameras || 0;
      d.Speed_Fines = +d.Speed_Fines || 0;
    });

    // Group data by state for line chart
    const groupedByState = d3.group(data, d => d.state);
    const years = [...new Set(data.map(d => d.year))];

    // Chart dimensions
    const margin = { top: 40, right: 60, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#line-view")
      .append("svg")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain(d3.extent(years))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Speed_Fines)]).nice()
      .range([height, 0]);

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));
    svg.append("g").call(d3.axisLeft(y));

    const color = d3.scaleOrdinal(d3.schemeTableau10);

    for (const [state, records] of groupedByState) {
      svg.append("path")
        .datum(records.sort((a, b) => a.year - b.year))
        .attr("fill", "none")
        .attr("stroke", color(state))
        .attr("stroke-width", 2)
        .attr("d", d3.line()
          .x(d => x(d.year))
          .y(d => y(d.Speed_Fines))
        );
    }
  });
}

function drawSpeedFinesTable() {
  d3.csv("./data/speeding_2008_2023.csv").then(data => {
    const stateFilter = document.getElementById("state-filter");
    const tbody = d3.select("#speed-fines-table tbody");

    data.forEach(d => {
      d.year = +d.year;
      d.speed_infringements_police = +d.speed_infringements_police || 0;
      d.speed_infringements_cameras = +d.speed_infringements_cameras || 0;
      d.Speed_Fines = +d.Speed_Fines || 0;
    });

    const states = Array.from(new Set(data.map(d => d.state))).sort();
    states.forEach(state => {
      const option = document.createElement("option");
      option.value = state;
      option.textContent = state;
      stateFilter.appendChild(option);
    });

    stateFilter.addEventListener("change", () => {
      const selectedState = stateFilter.value;
      const filtered = data.filter(d => d.state === selectedState)
                           .sort((a, b) => a.year - b.year);

      tbody.html("");

      for (let i = 0; i < filtered.length; i++) {
        const curr = filtered[i];
        const prev = filtered[i - 1];
        const pctChange = (i === 0 || !prev) ? "–" :
          (((curr.Speed_Fines - prev.Speed_Fines) / prev.Speed_Fines) * 100).toFixed(1) + "%";

        tbody.append("tr").html(`
          <td>${curr.year}</td>
          <td>${curr.state}</td>
          <td>${curr.Speed_Fines.toLocaleString()}</td>
          <td>${pctChange}</td>
          <td>${curr.speed_infringements_police.toLocaleString()}</td>
          <td>${curr.speed_infringements_cameras.toLocaleString()}</td>
        `);
      }
    });

    // Trigger once to fill initial table
    stateFilter.dispatchEvent(new Event("change"));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  drawSpeedFinesLineChart();
  drawSpeedFinesTable();

  const lineView = document.getElementById("line-view");
  const tableView = document.getElementById("table-view");

  document.getElementById("show-line").addEventListener("click", () => {
    lineView.style.display = "block";
    tableView.style.display = "none";
  });

  document.getElementById("show-table").addEventListener("click", () => {
    lineView.style.display = "none";
    tableView.style.display = "block";
  });
});
