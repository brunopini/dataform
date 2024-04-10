const {
    publishSilverTableFromStagingViews
} = require('includes/silver.js');


const fctTables = [
    {
        suffix: 'stats',
        partitionBy: 'date',
        clusterBy: ['app_id', 'campaign_id', 'adset_id', 'ad_id']
    },
];


const tableNature = 'fct';
const incremental = true;


fctTables.forEach(fctTable => {
    publishSilverTableFromStagingViews(fctTable, tableNature, incremental)
})
