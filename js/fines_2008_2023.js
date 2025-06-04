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

    // Default to NSW
    stateFilter.value = "NSW";

    stateFilter.addEventListener("change", () => {
      const selectedState = stateFilter.value;
      const filtered = data.filter(d => d.state === selectedState)
                           .sort((a, b) => a.year - b.year);

      tbody.html("");

      for (let i = 0; i < filtered.length; i++) {
        const curr = filtered[i];
        const prev = filtered[i - 1];
        let pctChange = "–";

        if (prev && prev.Speed_Fines !== 0) {
          const change = ((curr.Speed_Fines - prev.Speed_Fines) / prev.Speed_Fines) * 100;
          pctChange = isFinite(change) ? `${change.toFixed(1)}%` : "–";
        }

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

    stateFilter.dispatchEvent(new Event("change"));
  });
}

function drawSpeedFinesLineChart() {
  d3.csv("./data/speeding_2008_2023.csv").then(data => {
    data.forEach(d => {
      d.year = +d.year;
      d.speed_infringements_police = +d.speed_infringements_police || 0;
      d.speed_infringements_cameras = +d.speed_infringements_cameras || 0;
      d.Speed_Fines = +d.Speed_Fines || 0;
    });

    const groupedByState = d3.group(data, d => d.state);
    const allStates = Array.from(groupedByState.keys()).sort();
    const years = [...new Set(data.map(d => d.year))].sort((a, b) => a - b);

    // Chart dimensions
    const margin = { top: 40, right: 60, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#line-view")
      .append("svg")
      .attr("id", "speed-line-plot")
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

    const color = d3.scaleOrdinal(d3.schemeTableau10);
    const tooltip = d3.select("#line-view").append("div").attr("class", "tooltip-linechart");

    // Axes
    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));
    svg.append("g").call(d3.axisLeft(y));

    // Vertical grid lines
    svg.selectAll(".year-gridline")
      .data(years)
      .enter()
      .append("line")
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#999")
      .attr("stroke-width", 1)
      .style("stroke-dasharray", "2 4")
      .style("opacity", 0.4);

    const lineGroup = svg.append("g").attr("class", "lines");
    const pointGroup = svg.append("g").attr("class", "points");

    // Create state dropdown
    const select = document.getElementById("line-state-filter");
    allStates.forEach(state => {
      const option = document.createElement("option");
      option.value = state;
      option.textContent = state;
      select.appendChild(option);
    });

    // Draw function (state = "all" or specific state)
    function updateLineChart(selectedState = "all") {
      const filteredStates = selectedState === "all" ? allStates : [selectedState];

      lineGroup.selectAll("*").remove();
      pointGroup.selectAll("*").remove();

      filteredStates.forEach(state => {
        const stateData = groupedByState.get(state).sort((a, b) => a.year - b.year);

        lineGroup.append("path")
          .datum(stateData)
          .attr("fill", "none")
          .attr("stroke", color(state))
          .attr("stroke-width", 2)
          .attr("d", d3.line()
            .x(d => x(d.year))
            .y(d => y(d.Speed_Fines))
          );

        pointGroup.selectAll(`circle.${state}`)
          .data(stateData)
          .enter()
          .append("circle")
          .attr("class", state)
          .attr("cx", d => x(d.year))
          .attr("cy", d => y(d.Speed_Fines))
          .attr("r", 2.5)
          .attr("fill", color(state))
          .on("mouseover", (event, d) => {
            tooltip
              .style("opacity", 1)
              .html(`<strong>${d.state} ${d.year}</strong><br>
                    Total: ${d.Speed_Fines.toLocaleString()}<br>
                    Police: ${d.speed_infringements_police.toLocaleString()}<br>
                    Camera: ${d.speed_infringements_cameras.toLocaleString()}`);
          })
          .on("mousemove", event => {
            tooltip
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 40) + "px");
          })
          .on("mouseleave", () => {
            tooltip.style("opacity", 0);
          });
      });

      updateLegend(filteredStates);
    }

    function updateLegend(statesToShow) {
      const legendContainer = d3.select("#line-legend");
      legendContainer.html(""); // Clear

      statesToShow.forEach(state => {
        const legendItem = document.createElement("span");
        legendItem.style.display = "inline-block";
        legendItem.style.marginRight = "15px";
        legendItem.innerHTML = `<span style="display:inline-block;width:15px;height:15px;
                                 background-color:${color(state)};
                                 border-radius:3px;
                                 margin-right:5px;"></span>${state}`;
        legendContainer.node().appendChild(legendItem);
      });
    }

    // Initial draw
    updateLineChart("all");

    // Dropdown filter event
    select.addEventListener("change", () => {
      updateLineChart(select.value);
    });
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
