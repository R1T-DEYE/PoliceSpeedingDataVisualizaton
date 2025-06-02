const drawFigures = (speedingData, fatalCrashesData) => {
    // --- Speeding Data Stats ---
    const totalFines = d3.sum(speedingData, d => d.fines);

    const cameraKeywords = ["camera", "fixed", "mobile", "average"];
    const cameraFines = d3.sum(speedingData, d => {
        const method = d.detection?.toLowerCase() || "";
        return cameraKeywords.some(k => method.includes(k)) ? d.fines : 0;
    });

    const policeFines = d3.sum(speedingData, d => {
        const method = d.detection?.toLowerCase() || "";
        return method.includes("police") ? d.fines : 0;
    });

    const finesByJurisdiction = d3.rollup(
        speedingData,
        v => d3.sum(v, d => d.fines),
        d => d.jurisdiction
    );

    const sortedFines = Array.from(finesByJurisdiction.entries()).sort((a, b) => b[1] - a[1]);
    const highest = sortedFines[0]; // most fines

    // --- Fatal Crashes Stats ---
    const totalFatalities = d3.sum(fatalCrashesData, d => d.fatalities);

    // --- Create Key Figures ---
    const keyFigures = [
        { title: "Total Speeding Fines", value: totalFines.toLocaleString() },
        { title: "Fines Issued by Camera", value: cameraFines.toLocaleString() },
        { title: "Fines Issued by Police", value: policeFines.toLocaleString() },
        { title: `Most Fines - ${highest[0]}`, value: highest[1].toLocaleString() },
        { title: "Total Fatalities", value: totalFatalities.toLocaleString() }
    ];

    // --- Render ---
    const dashboard = d3.select("#figures");
    dashboard.selectAll(".stat-box").remove(); // Clear previous

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
