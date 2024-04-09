const { 
    lookBackDays
} = require('config.js');

const lookBackWeeks = math.ceil(parseInt(lookBackDays) / 7).toString();
const lookBackMonths = math.ceil(parseInt(lookBackDays) / 30).toString();
const lookBackYears = math.ceil(parseInt(lookBackDays) / 365).toString();


function lookBackDate(dateConstruct, lookBackUnits = lookBackDays) {
    let lookBackUnits = lookBackUnits;
    // Defaults to DAY intervals and DATETIME outputs
    let lookBackDate = `TIMESTAMP_SUB(${dateConstruct}, INTERVAL ${lookBackUnits} DAY))`;
    if(dateConstruct.toLowerCase().includes('week')){
        lookBackUnits = lookBackWeeks;
        lookBackDate = `DATE(TIMETAMP_SUB(${dateConstruct}, INTERVAL ${lookBackUnits} WEEK))`
    } else if(dateConstruct.toLowerCase().includes('month')){
        lookBackUnits = lookBackMonths;
        lookBackDate = `DATE(TIMETAMP_SUB(${dateConstruct}, INTERVAL ${lookBackUnits} MONTH))`
    } else if(dateConstruct.toLowerCase().includes('year')){
        lookBackUnits = lookBackYears;
        lookBackDate = `DATE(TIMETAMP_SUB(${dateConstruct}, INTERVAL ${lookBackUnits} YEAR))`
    }

    return lookBackDate
}

function declareInsertDateCheckpoint(ctx, dateConstruct = 'date') {
    return `
        DECLARE insert_date_checkpoint DEFAULT (
            ${
                ctx.when(ctx.incremental(),
                    `SELECT ${lookBackDate(`MAX(${dateConstruct})`)} FROM ${ctx.self()}`,
                    `SELECT DATE('2000-01-01')`)
            }
        );`
}
