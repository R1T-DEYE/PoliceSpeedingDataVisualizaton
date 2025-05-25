const drawBar = (speedData, fatalData) => {
    const container = d3.select("#bar");
    container.html(""); // Clear previous content

    // === Aggregate data by month ===
    const finesByMonth = d3.rollup(speedData, v => d3.sum(v, d => d.fines), d => d.startDate.getMonth() + 1);
    const fatalitiesByMonth = d3.rollup(fatalData, v => d3.sum(v, d => d.fatalities), d => +d.month);

    const allMonths = d3.range(1, 13); // Months 1 to 12

    const combinedData = allMonths.map(month => ({
        month,
        fines: finesByMonth.get(month) || 0,
        fatalities: fatalitiesByMonth.get(month) || 0
    }));

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // === Add toggle button ===
    const toggleBtn = container.append("button")
        .text("Switch to Table View")
        .attr("id", "toggleView");

    let isTable = false;

    toggleBtn.on("click", () => {
        isTable = !isTable;
        toggleBtn.text(isTable ? "Switch to Chart View" : "Switch to Table View");
        renderView();
    });

    function renderView() {
        container.selectAll(".chart-or-table").remove();

        if (isTable) {
            renderTable(combinedData);
        } else {
            renderChart(combinedData);
        }
    }

    function renderChart(data) {
        const margin = { top: 40, right: 40, bottom: 60, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = container.append("svg")
            .attr("class", "chart-or-table")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(data.map(d => monthNames[d.month - 1]))
            .range([0, width])
            .padding(0.2);

        const yMax = d3.max(data, d => Math.max(d.fines, d.fatalities));
        const y = d3.scaleLinear()
            .domain([0, yMax * 1.1])  // 10% padding on top
            .range([height, 0]);

        // Axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));

        // Bars for fines
        svg.selectAll(".bar.fines")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar fines")
            .attr("x", d => x(monthNames[d.month - 1]))
            .attr("y", d => y(d.fines))
            .attr("width", x.bandwidth() / 2)
            .attr("height", d => height - y(d.fines))
            .attr("fill", "steelblue");

        // Bars for fatalities
        svg.selectAll(".bar.fatalities")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar fatalities")
            .attr("x", d => x(monthNames[d.month - 1]) + x.bandwidth() / 2)
            .attr("y", d => y(d.fatalities))
            .attr("width", x.bandwidth() / 2)
            .attr("height", d => height - y(d.fatalities))
            .attr("fill", "tomato");

        // Legend
        const legend = svg.append("g")
            .attr("transform", `translate(${width - 150}, -30)`);

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", "steelblue");

        legend.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .text("Fines")
            .style("font-size", "12px");

        legend.append("rect")
            .attr("x", 70)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", "tomato");

        legend.append("text")
            .attr("x", 95)
            .attr("y", 12)
            .text("Fatalities")
            .style("font-size", "12px");

        // Labels
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Monthly Speeding Fines and Fatalities - 2023");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .attr("text-anchor", "middle")
            .text("Month");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -50)
            .attr("x", -height / 2)
            .attr("text-anchor", "middle")
            .text("Count");
    }

    function renderTable(data) {
        const table = container.append("table")
            .attr("class", "chart-or-table")
            .style("border-collapse", "collapse")
            .style("width", "100%");

        const thead = table.append("thead");
        const tbody = table.append("tbody");

        thead.append("tr")
            .selectAll("th")
            .data(["Month", "Fines", "Fatalities"])
            .enter()
            .append("th")
            .text(d => d)
            .style("border", "1px solid black")
            .style("padding", "8px")
            .style("background-color", "#f2f2f2");

        tbody.selectAll("tr")
            .data(data)
            .enter()
            .append("tr")
            .selectAll("td")
            .data(d => [monthNames[d.month - 1], d.fines.toLocaleString(), d.fatalities.toLocaleString()])
            .enter()
            .append("td")
            .text(d => d)
            .style("border", "1px solid black")
            .style("padding", "8px");
    }

    // Initial render
    renderView();
};
