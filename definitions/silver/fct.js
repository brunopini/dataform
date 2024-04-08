const {
    publishSilverTableFromStagingViews
} = require('includes/silver.js');


const fctTables = [
    {
        suffix: 'stats',
        partitionBy: 'date',
        clusterBy: ['advertiser_id', 'campaign_id', 'adset_id', 'ad_id']
    },
];


const tableType = 'fct';
const incremental = true;


fctTables.forEach(fctTable => {
    publishSilverTableFromStagingViews(fctTable, tableType, incremental)
})
