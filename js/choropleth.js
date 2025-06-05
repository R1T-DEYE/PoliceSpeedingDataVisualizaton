const drawChoropleth = (data) => {
    // Aggregate fines per jurisdiction
    const finesByJurisdiction = d3.rollup(
        data,
        v => d3.sum(v, d => d.fines),
        d => d.jurisdiction
    );

    // SVG and Projection
    const container = d3.select("#choropleth");
    const svg = container.append("svg")
        .attr("width", 800)
        .attr("height", 500)
        .style("border", "2px solid black");

    // Tooltip
    const tooltip = d3.select("body")
        .append("div")
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

    const projection = d3.geoMercator()
        .scale(700)
        .center([134, -31])
        .translate([400, 300]);

    const path = d3.geoPath().projection(projection);

    // Color scale
    const fineValues = Array.from(finesByJurisdiction.values());
    const maxFines = d3.max(fineValues);
    const minFines = d3.min(fineValues);

    const colorScale = d3.scaleSequential()
        .domain([minFines, maxFines])
        .interpolator(d3.interpolateYlOrRd);

    // Load GeoJSON and render map
    d3.json("https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/australia.geojson")
        .then(topo => {
            // Draw all features
            svg.append("g")
                .selectAll("path")
                .data(topo.features)
                .enter().append("path")
                .attr("d", path)
                .attr("fill", d => {
                    const state = d.properties.name;
                    const value = finesByJurisdiction.get(state);
                    return value ? colorScale(value) : "#ccc";
                })
                .attr("stroke", "black")
                .on("mouseover", (event, d) => {
                    const state = d.properties.name;
                    const value = finesByJurisdiction.get(state) || 0;
                    tooltip.style("visibility", "visible")
                        .html(`<strong>${state}</strong><br/>Fines: ${value.toLocaleString()}`);
                })
                .on("mousemove", (event) => {
                    tooltip
                        .style("top", (event.pageY + 10) + "px")
                        .style("left", (event.pageX + 10) + "px");
                })
                .on("mouseout", () => {
                    tooltip.style("visibility", "hidden");
                });

            // === ACT ZOOMED INSET ===
            const actFeature = topo.features.find(f => f.properties.name === "Australian Capital Territory");

            if (actFeature) {
                // === Inset Projection for ACT ===
                const actProj = d3.geoMercator()
                    .center([149.12, -35.28])
                    .scale(5000)
                    .translate([700, 380]);

                const actPath = d3.geoPath().projection(actProj);

                // Draw zoomed ACT
                svg.append("path")
                    .datum(actFeature)
                    .attr("d", actPath)
                    .attr("fill", () => {
                        const value = finesByJurisdiction.get("Australian Capital Territory");
                        return value ? colorScale(value) : "#ccc";
                    })
                    .attr("stroke", "black")
                    .attr("stroke-width", 0.5)
                    .on("mouseover", (event) => {
                        const value = finesByJurisdiction.get("Australian Capital Territory") || 0;
                        tooltip.style("visibility", "visible")
                            .html(`<strong>Australian Capital Territory (Zoomed)</strong><br/>Fines: ${value.toLocaleString()}`);
                    })
                    .on("mousemove", (event) => {
                        tooltip
                            .style("top", (event.pageY + 10) + "px")
                            .style("left", (event.pageX + 10) + "px");
                    })
                    .on("mouseout", () => {
                        tooltip.style("visibility", "hidden");
                    });

                // Add label
                svg.append("text")
                    .attr("x", 655)
                    .attr("y", 360)
                    .text("ACT (Zoomed)")
                    .style("font-size", "12px")
                    .style("font-weight", "bold");

                // === Connector Line from small ACT to zoomed ACT ===
                const actCentroid = d3.geoCentroid(actFeature);
                const originalCoord = projection(actCentroid);
                const zoomedCoord = actProj(actCentroid);

                svg.append("line")
                    .attr("x1", originalCoord[0])
                    .attr("y1", originalCoord[1])
                    .attr("x2", zoomedCoord[0])
                    .attr("y2", zoomedCoord[1])
                    .attr("stroke", "#333")
                    .attr("stroke-dasharray", "4 2")
                    .attr("stroke-width", 1);
            }


        })
        .catch(error => {
            console.error("Error loading GeoJSON:", error);
        });

    // === LEGEND ===
    const legendWidth = 250;
    const legendHeight = 10;

    const legendSvg = svg.append("g")
        .attr("transform", `translate(50, 450)`);

    const defs = svg.append("defs");

    const linearGradient = defs.append("linearGradient")
        .attr("id", "legend-gradient");

    linearGradient.selectAll("stop")
        .data(d3.ticks(0, 1, 10))
        .enter().append("stop")
        .attr("offset", d => `${d * 100}%`)
        .attr("stop-color", d => colorScale(minFines + d * (maxFines - minFines)));

    legendSvg.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)")
        .style("stroke", "black");

    const legendScale = d3.scaleLinear()
        .domain([minFines, maxFines])
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickFormat(d3.format(".2s"));

    legendSvg.append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(legendAxis);
};
