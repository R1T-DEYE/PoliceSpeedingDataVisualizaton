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
    const maxFines = d3.max(data, d => d.fines);
    const minFines = d3.min(data, d => d.fines);

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
};
