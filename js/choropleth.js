

const drawChoropleth = (data) => {
    // Aggregate fines per jurisdiction
    const finesByJurisdiction = d3.rollup(
        data,
        v => d3.sum(v, d => d.fines),
        d => d.jurisdiction
    );

    // SVG and Projection
    const svg = d3.select("#choropleth")
        .append("svg")
        .attr("width", 800)
        .attr("height", 500)
        .style("border", "2px solid black");


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
    .domain([minFines, maxFines]) // or [0, maxFines] if you prefer starting at 0
    .interpolator(d3.interpolateYlOrRd);

    // Load GeoJSON
    d3.json("https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/australia.geojson")
        .then(topo => {
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
                .append("title")
                .text(d => {
                    const state = d.properties.name;
                    const value = finesByJurisdiction.get(state);
                    return `${state}: ${value || 0} fines`;
                });
        })
        .catch(error => {
            console.error("Error loading GeoJSON:", error);
        });



    // Legend dimensions
    const legendWidth = 250;
    const legendHeight = 10;

    const legendSvg = svg.append("g")
        .attr("transform", `translate(50, 450 )`);

    // Create a gradient
    const defs = svg.append("defs");

    const linearGradient = defs.append("linearGradient")
        .attr("id", "legend-gradient");

    linearGradient.selectAll("stop")
        .data(d3.ticks(0, 1, 10))  // 10 stops
        .enter().append("stop")
        .attr("offset", d => `${d * 100}%`)
        .attr("stop-color", d => colorScale(minFines + d * (maxFines - minFines)));

    // Draw the gradient rectangle
    legendSvg.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)")
        .style("stroke", "black");

    // Add labels
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
