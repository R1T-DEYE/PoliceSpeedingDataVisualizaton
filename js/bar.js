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

    // Tooltip div
    
    const margin = { top: 50, right: 60, bottom: 60, left: 80 };
    const width = 900 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    

    // Add this inside renderChart(data) before creating the SVG
    const tooltip = container.append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "rgba(0,0,0,0.7)")
        .style("color", "#fff")
        .style("padding", "6px 10px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("z-index", 10);


    const svg = container.append("svg")
        .attr("class", "chart-or-table")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("border", "1px solid black")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(data.map(d => monthNames[d.month - 1]))
        .range([0, width])
        .padding(0.2);

    // Left y-axis for fines (bars)
    const yLeftMax = d3.max(data, d => d.fines);
    const yLeft = d3.scaleLinear()
        .domain([0, yLeftMax * 1.1])
        .range([height, 0]);

    // Right y-axis for fatalities (line)
    const yRightMax = d3.max(data, d => d.fatalities);
    const yRight = d3.scaleLinear()
        .domain([0, yRightMax * 1.1])
        .range([height, 0]);

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Add left y-axis (fines)
    svg.append("g")
        .call(d3.axisLeft(yLeft))
        .append("text")
        .attr("fill", "steelblue")
        .attr("transform", "rotate(-90)")
        .attr("y", -70)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text("Fines")
        .style("font-size", "16px");    // Increase text size

    // Add right y-axis (fatalities)
    svg.append("g")
        .attr("transform", `translate(${width},0)`)
        .call(d3.axisRight(yRight))
        .append("text")
        .attr("fill", "tomato")
        .attr("transform", "rotate(-90)")
        .attr("y", 55)
        .attr("x", -height / 2)
        .attr("dy", "-1em")
        .attr("text-anchor", "middle")
        .text("Fatalities")
        .style("font-size", "16px");

        

    // Bars for fines
    svg.selectAll(".bar.fines")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar fines")
        .attr("x", d => x(monthNames[d.month - 1]))
        .attr("y", d => yLeft(d.fines))
        .attr("width", x.bandwidth())
        .attr("height", d => height - yLeft(d.fines))
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
                .html(`<strong>${monthNames[d.month - 1]}</strong><br/>Fines: ${d.fines.toLocaleString()}`);
        })
        .on("mousemove", (event, d) => {
            const svgRect = svg.node().getBoundingClientRect();
        tooltip.style("top", (event.clientY - svgRect.top) + "px")
                .style("left", (event.clientX - svgRect.left) + "px");
        })
        .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
        });


    
    

    // Line for fatalities
    const line = d3.line()
        .x(d => x(monthNames[d.month - 1]) + x.bandwidth() / 2)
        .y(d => yRight(d.fatalities));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "tomato")
        .attr("stroke-width", 2)
        .attr("d", line);


    // Circles on the line for fatalities
        


    svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(monthNames[d.month - 1]) + x.bandwidth() / 2)
        .attr("cy", d => yRight(d.fatalities))
        .attr("r", 5)
        .attr("fill", "tomato")
        .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
                .html(`<strong>${monthNames[d.month - 1]}</strong><br/>Fatalities: ${d.fatalities.toLocaleString()}`);
        })
        .on("mousemove", (event, d) => {
            const svgRect = svg.node().getBoundingClientRect();
        tooltip.style("top", (event.clientY - svgRect.top) + "px")
                .style("left", (event.clientX - svgRect.left) + "px");
        })
        .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
        });


        

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
        .attr("x", 90)
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
