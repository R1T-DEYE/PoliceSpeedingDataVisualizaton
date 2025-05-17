
// cbf changing names in csv lmaoooo
const stateNameMap = {
    'VIC': 'Victoria',
    'NSW': 'New South Wales',
    'QLD': 'Queensland',
    'WA': 'Western Australia',
    'SA': 'South Australia',
    'TAS': 'Tasmania',
    'NT': 'Northern Territory',
    'ACT': 'Australian Capital Territory'
};

d3.csv("data/police_enforcement_speeding_2023.csv", d => ({
    year: +d.YEAR,
    startDate: new Date(d.START_DATE),
    endDate: new Date(d.END_DATE),
    jurisdiction: d.JURISDICTION,
    location: d.LOCATION,
    ageGroup: d.AGE_GROUP,
    detection: d.DETECTION_METHOD,
    fines: +d.FINES,
    arrests: +d.ARRESTS,
    charges: +d.CHARGES

    
})).then(data => {

    // Convert abbreviation to full state name
    data.forEach(d => {
        d.jurisdiction = stateNameMap[d.jurisdiction] || d.jurisdiction;
    });

    console.log(data);
    drawChoropleth(data);


}).catch(error => {
    console.error("Error loading the data: ", error);
});
