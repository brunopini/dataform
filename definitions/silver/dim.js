const {
    publishSilverTableFromStagingViews
} = require('includes/silver.js');


const dimTables = [
    {
        suffix: 'app',
        clusterBy: []
    },
    {
        suffix: 'campaign',
        clusterBy: ['advertiser_id']
    },
    {
        suffix: 'adset',
        clusterBy: ['advertiser_id', 'campaign_id']
    },
    {
        suffix: 'ad',
        clusterBy: ['app_id', 'adset_id']
    }
];


const tableNature = 'dim';


dimTables.forEach(dimTable => {
    publishSilverTableFromStagingViews(dimTable, tableNature)
})
