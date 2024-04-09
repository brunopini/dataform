const { 
    lookBackDays
} = require('config.js');


function lookBackDate(dateConstruct, fromCurrentTimestamp = false, unitIncrement) {
    let date;
    let increment;
    if(fromCurrentTimestamp) {
        date = 'CURRENT_TIMESTAMP()';
        increment = unitIncrement ? unitIncrement : 1;
    } else {
        increment = unitIncrement ? unitIncrement : 0;
        date = dateConstruct;
    }

    // Convert lookBackDays to ensure it's an integer
    let units = parseInt(lookBackDays, 10);

    // Now construct the lookBackDate using the possibly adjusted units
    let unitType;
    if(dateConstruct.toLowerCase().includes('week')){
        unitType = 'WEEK';
        date = `DATE(${date})`;
        units = Math.ceil(units / 7) + increment;
    } else if(dateConstruct.toLowerCase().includes('month')){
        unitType = 'MONTH';
        date = `DATE(${date})`;
        units = Math.ceil(units / 30) + increment;
    } else if(dateConstruct.toLowerCase().includes('year')){
        unitType = 'YEAR';
        date = `DATE(${date})`;
        units = Math.ceil(units / 365) + increment;
    } else {
        unitType = 'DAY'
    }

    return `DATE(TIMESTAMP_SUB(${date}, INTERVAL ${units} ${unitType}))`;
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

module.exports = {
    lookBackDate,
    declareInsertDateCheckpoint
}
