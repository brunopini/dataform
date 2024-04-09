const {
    publishSilverTableFromStagingViews
} = require('includes/silver.js');


const dimTables = [
    {
        suffix: 'advertiser',
        clusterBy: []
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
    publishSilverTableFromStagingViews(dimTable, tableNature, true, [''])
})
