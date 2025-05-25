
// replace annotation from csv into full name
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

const filesAndParsers = [
    {
        path: "data/police_enforcement_speeding_2023.csv",
        parser: d => ({
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
        }),
        needsStateMapping: true
    },
    {
        path: "data/cleaned_up_fatal_crashes.csv",
        parser: d => ({
            year: +d.Year,            
            month: +d.Month,          
            fatalities: +d.Num_Fatalities  
        }),
        needsStateMapping: false  // Jurisdiction mapping not needed here 
    }
];

// Load all files with their parsers
Promise.all(
    filesAndParsers.map(({path, parser, needsStateMapping}) =>
        d3.csv(path, parser).then(data => {
            if (needsStateMapping) {
                data.forEach(d => {
                    d.jurisdiction = stateNameMap[d.jurisdiction] || d.jurisdiction;
                });
            }
            return data;
        })
    )
).then(datasets => {
    const speedingData = datasets[0];
    const fatalCrashesData = datasets[1];

    console.log("Speeding Data", speedingData);
    console.log("Fatal Crashes Data", fatalCrashesData);

    drawFigures(speedingData);
    drawBar(speedingData, fatalCrashesData);
    drawChoropleth(speedingData);

    

}).catch(error => {
    console.error("Error loading one or more files: ", error);
});
