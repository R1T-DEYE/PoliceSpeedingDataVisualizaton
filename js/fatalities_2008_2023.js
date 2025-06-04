function drawFatalitiesLineChart() {
  d3.csv("./data/cleaned_up_fatal_crashes_ALL_YEARS.csv").then(data => {
    data.forEach(d => {
      d.Year = +d.Year;
      d.Num_Fatalities = +d.Num_Fatalities || 0;
      d.State = d.State.trim().toUpperCase();
    });

    data = data.filter(d => d.Year >= 2008 && d.Year <= 2024);

    const aggregated = d3.rollups(
      data,
      v => d3.sum(v, d => d.Num_Fatalities),
      d => d.State,
      d => d.Year
    );

    const stateYearMap = aggregated.map(([state, yearData]) => ({
      state,
      values: yearData.map(([year, total]) => ({ year, fatalities: total }))
    }));

    const allStates = Array.from(new Set(stateYearMap.map(d => d.state))).sort();
    const allYears = Array.from(new Set(data.map(d => d.Year))).sort();

    const margin = { top: 40, right: 60, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#fatality-line-view")
      .append("svg")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain(d3.extent(allYears))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(stateYearMap.flatMap(s => s.values.map(d => d.fatalities)))])
      .nice()
      .range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeTableau10);
    const tooltip = d3.select("#fatality-line-view").append("div").attr("class", "tooltip-linechart");

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));
    svg.append("g").call(d3.axisLeft(y));
    // Vertical grid lines
    svg.selectAll(".year-gridline")
    .data(allYears)
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

    const select = document.getElementById("fatality-state-filter");
    allStates.forEach(state => {
      const option = document.createElement("option");
      option.value = state;
      option.textContent = state;
      select.appendChild(option);
    });

    function updateLineChart(selectedState = "all") {
      const filtered = selectedState === "all" ? stateYearMap : stateYearMap.filter(d => d.state === selectedState);

      lineGroup.selectAll("*").remove();
      pointGroup.selectAll("*").remove();

      filtered.forEach(({ state, values }) => {
        values.sort((a, b) => a.year - b.year);

        lineGroup.append("path")
        .datum(values)
        .attr("fill", "none")
        .attr("stroke", color(state))
        .attr("stroke-width", 2)
        .attr("d", d3.line()
        .x(d => x(d.year))
        .y(d => y(d.fatalities))
        );

        pointGroup.selectAll(`circle.${state}`)
        .data(values)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.fatalities))
        .attr("r", 3)
        .attr("fill", color(state))
        .on("mouseover", (event, d) => {
            tooltip
              .style("opacity", 1)
              .html(`<strong>${state} ${d.year}</strong><br>Total fatalities: ${d.fatalities}`);
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

      updateLegend(filtered.map(f => f.state));
    }

    function updateLegend(statesToShow) {
      const legendContainer = d3.select("#fatality-legend");
      legendContainer.html("");

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

    updateLineChart("all");
    select.addEventListener("change", () => {
      updateLineChart(select.value);
    });
  });
}

function drawFatalitiesTable() {
  d3.csv("./data/cleaned_up_fatal_crashes_ALL_YEARS.csv").then(data => {
    const tableFilter = document.getElementById("fatality-table-filter");
    const tbody = d3.select("#fatality-table tbody");

    data.forEach(d => {
      d.Year = +d.Year;
      d.Num_Fatalities = +d.Num_Fatalities || 0;
      d.State = d.State.trim().toUpperCase();
    });

    data = data.filter(d => d.Year >= 2008 && d.Year <= 2024);

    const totals = d3.rollups(
      data,
      v => d3.sum(v, d => d.Num_Fatalities),
      d => d.State,
      d => d.Year
    ).map(([state, yearData]) => yearData.map(([year, fatalities]) => ({ state, year, fatalities })))
     .flat()
     .sort((a, b) => a.state.localeCompare(b.state) || a.year - b.year);

    const allStates = Array.from(new Set(totals.map(d => d.state))).sort();
    allStates.forEach(state => {
      const option = document.createElement("option");
      option.value = state;
      option.textContent = state;
      tableFilter.appendChild(option);
    });

    tableFilter.value = "NSW";

    tableFilter.addEventListener("change", () => {
      const selected = tableFilter.value;
      const rows = totals.filter(d => d.state === selected);
      tbody.html("");

      for (let i = 0; i < rows.length; i++) {
        const curr = rows[i];
        const prev = rows[i - 1];
        let change = "–";

        if (prev && prev.fatalities > 0) {
          const diff = ((curr.fatalities - prev.fatalities) / prev.fatalities) * 100;
          change = `${diff.toFixed(1)}%`;
        }

        tbody.append("tr").html(`
          <td>${curr.year}</td>
          <td>${curr.state}</td>
          <td>${curr.fatalities.toLocaleString()}</td>
          <td>${change}</td>
        `);
      }
    });

    tableFilter.dispatchEvent(new Event("change"));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  drawFatalitiesLineChart();
  drawFatalitiesTable();

  const line = document.getElementById("fatality-line-view");
  const table = document.getElementById("fatality-table-view");

  document.getElementById("show-line-fatalities").addEventListener("click", () => {
    line.style.display = "block";
    table.style.display = "none";
  });

  document.getElementById("show-table-fatalities").addEventListener("click", () => {
    line.style.display = "none";
    table.style.display = "block";
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const showLineBtn = document.getElementById("show-line-fatalities");
  const showTableBtn = document.getElementById("show-table-fatalities");

  const lineView = document.getElementById("fatality-line-view");
  const tableView = document.getElementById("fatality-table-view");

  const lineStateFilterLabel = document.querySelector('label[for="fatality-state-filter"]');
  const lineStateFilterSelect = document.getElementById("fatality-state-filter");

  showLineBtn.addEventListener("click", () => {
    lineView.style.display = "block";
    tableView.style.display = "none";

    lineStateFilterLabel.style.display = "inline-block";
    lineStateFilterSelect.style.display = "inline-block";
  });

  showTableBtn.addEventListener("click", () => {
    lineView.style.display = "none";
    tableView.style.display = "block";

    lineStateFilterLabel.style.display = "none";
    lineStateFilterSelect.style.display = "none";
  });
});
