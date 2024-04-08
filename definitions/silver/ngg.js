const {
    publishSilverTableFromStagingViews
} = require('includes/silver.js');


const commonClusterBy = ['advertiser_id', 'id'];

const nggTables = [
    {
        suffix: 'stats_day_reach',
        partitionBy: 'date',
        clusterBy: ['advertiser_id', 'campaign_id', 'adset_id', 'ad_id']
    },
    {
        suffix: 'adset_month_reach',
        partitionBy: 'month',
        clusterBy: commonClusterBy
    },
    {
        suffix: 'adset_week_reach',
        partitionBy: 'week',
        clusterBy: commonClusterBy
    },
    {
        suffix: 'adset_year_reach',
        partitionBy: 'year',
        clusterBy: commonClusterBy
    },
    {
        suffix: 'campaign_month_reach',
        partitionBy: 'month',
        clusterBy: commonClusterBy
    },
    {
        suffix: 'campaign_week_reach',
        partitionBy: 'week',
        clusterBy: commonClusterBy
    },
    {
        suffix: 'campaign_year_reach',
        partitionBy: 'year',
        clusterBy: commonClusterBy
    },
];


const tableNature = 'ngg';
const incremental = true;


nggTables.forEach(nggTable => {
    publishSilverTableFromStagingViews(nggTable, tableNature, incremental)
})
