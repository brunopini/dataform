const {
    publishSilverTableFromStagingViews
} = require('includes/silver.js');


const nggTables = [
    {
        suffix: 'stats_day_reach',
        partitionBy: 'date',
        clusterBy: ['advertiser_id', 'campaign_id', 'adset_id', 'ad_id']
    },
    {
        suffix: 'adset_month_reach',
        partitionBy: 'month',
        clusterBy: ['advertiser_id', 'adset_id']
    },
    {
        suffix: 'adset_week_reach',
        partitionBy: 'week',
        clusterBy: ['advertiser_id', 'adset_id']
    },
    {
        suffix: 'adset_year_reach',
        partitionBy: 'year',
        clusterBy: ['advertiser_id', 'adset_id']
    },
    {
        suffix: 'campaign_month_reach',
        partitionBy: 'month',
        clusterBy: ['advertiser_id', 'campaign_id']
    },
    {
        suffix: 'campaign_week_reach',
        partitionBy: 'week',
        clusterBy: ['advertiser_id', 'campaign_id']
    },
    {
        suffix: 'campaign_year_reach',
        partitionBy: 'year',
        clusterBy: ['advertiser_id', 'campaign_id']
    },
];


const tableNature = 'ngg';
const incremental = true;


nggTables.forEach(fctTable => {
    publishSilverTableFromStagingViews(fctTable, tableNature, incremental)
})
