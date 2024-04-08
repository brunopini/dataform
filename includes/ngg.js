const {
    targetSchemaSuffix
} = require('config.js');


const dimColumns = (ctx, entityRaw = '', timeframeRaw = '', timeframeAlias = timeframeRaw.toLowerCase()) => [
    { name: `DATE(${timeframeRaw})`, type: 'DATE NOT NULL', alias: timeframeAlias, constraints: [
        'PRIMARY KEY'] },
    { name: `${entityRaw}Id`, type: 'STRING NOT NULL', alias: 'id', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY (advertiser_id) ${ctx.ref(targetSchemaSuffix, `dim_${entityRaw.toLowerCase()}`)}(id, advertiser_id)`] },
    { name: 'AdvertiserId', type: 'STRING NOT NULL', alias: 'advertiser_id', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY ${ctx.ref(targetSchemaSuffix, 'dim_advertiser')}(id)`] },
];
    
const metricColumns = [
    { name: 'CAST(Audience AS NUMERIC)', type: 'NUMERIC', alias: 'audience_size' },
    { name: 'CAST(ExposedUsers AS NUMERIC)', type: 'NUMERIC', alias: 'exposed_users' },
    { name: 'CAST(Visits AS NUMERIC)', type: 'NUMERIC', alias: 'visits' },
    { name: 'CAST(QualifiedVisits AS NUMERIC)', type: 'NUMERIC', alias: 'qualified_visits' },
];

const columns = (ctx, entityRaw = '', timeframeRaw = '', timeframeAlias = '') => [
    ...dimColumns(ctx, entityRaw, timeframeRaw, timeframeAlias), // Spread the dimension columns into the array
    ...metricColumns     // Append the metric columns
];

module.exports = {
    metricColumns,
    columns
};
