const {
    publishSilverTableFromStagingViews
} = require('includes/silver.js');


const dimTables = [
    {
        suffix: 'advertiser',
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
        suffix: 'coupon',
        clusterBy: ['advertiser_id', 'adset_id']
    },
    {
        suffix: 'ad',
        clusterBy: ['advertiser_id', 'adset_id']
    },
    {
        suffix: 'creative',
        clusterBy: ['advertiser_id']
    },
    {
        suffix: 'category',
        clusterBy: []
    },
    {
        suffix: 'channel',
        clusterBy: []
    },
    {
        suffix: 'marketing_objective',
        clusterBy: []
    },
]


const tableNature = 'dim';


dimTables.forEach(dimTable => {
    publishSilverTableFromStagingViews(dimTable, tableNature)
})
