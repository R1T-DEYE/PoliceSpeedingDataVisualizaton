

const drawFigures = (data) => {
    // Aggregate fines per jurisdiction
    const finesByJurisdiction = d3.rollup(
        data,
        v => d3.sum(v, d => d.fines),
        d => d.jurisdiction
    );

    const totalFines = d3.sum(data, d => d.fines);
    const avgFines = totalFines / finesByJurisdiction.size;

    const sortedFines = Array.from(finesByJurisdiction.entries()).sort((a, b) => b[1] - a[1]);
    const highest = sortedFines[0];
    const lowest = sortedFines[sortedFines.length - 1];

    const keyFigures = [
        { title: "Total Fines", value: totalFines.toLocaleString() },
        { title: "Average per Jurisdiction", value: Number(avgFines.toFixed(3)).toLocaleString() },
        { title: `Most Fines - ${highest[0]}`, value: highest[1].toLocaleString() },
        { title: `Least Fines - ${lowest[0]}`, value: lowest[1].toLocaleString() },
        { title: `Test - ${lowest[0]}`, value: lowest[1].toLocaleString() },
        
    ];


    // Render the key figures
    const dashboard = d3.select("#figures");

    dashboard.selectAll(".stat-box")
        .data(keyFigures)
        .enter()
        .append("div")
        .attr("class", "stat-box")
        .html(d => `
        <div class="stat-title">${d.title}</div>
        <div class="stat-value">${d.value}</div>
    `);
};