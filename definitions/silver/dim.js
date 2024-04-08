const {
    businessUnits,
    sourceSchemaSufix
} = require('config.js');
const {
    createOrReplaceTableInplace,
    generateSchemaDefinition
} = require('includes/schema.js');
const {
    generateUnionAllQuery
} = require('includes/utils.js');


const dimTables = [
    {
        sufix: 'advertiser',
        clusterBy: []
    },
    {
        sufix: 'campaign',
        clusterBy: ['advertiser']
    },
    {
        sufix: 'adset',
        clusterBy: ['advertiser', 'campaign']
    },
    {
        sufix: 'coupon',
        clusterBy: ['advertiser', 'campaign', 'adset']
    },
    {
        sufix: 'ad',
        clusterBy: ['advertiser', 'campaign', 'adset']
    },
    {
        sufix: 'creative',
        clusterBy: ['advertiser']
    },
    {
        sufix: 'category',
        clusterBy: []
    },
    {
        sufix: 'channel',
        clusterBy: []
    },
    {
        sufix: 'marketing_objetive',
        clusterBy: []
    },
]


function publishDimTableFromStagingViews(dimTable) {
    const tableSufix = dimTable.sufix;
    const {
        columns,
        uniqueAssertion,
        nonNullAssertion
    } = require(`definitions/staging/dim/stg_${tableSufix}.js`);

    const clusterBy = dimTable.clusterBy;

    // Assume businessUnits is an array of business unit objects, each with schemaPrefix property
    publish(`dim_${tableSufix}`, {
        type: 'table',
        assertions: {
            uniqueKey: uniqueAssertion,
            nonNull: nonNullAssertion
        },
        bigquery: {
            clusterBy: clusterBy
        },
        tags: ['silver', 'table', 'dim']
    }).query(ctx => {
        // Create an array to hold the union parts for each business unit
        let unionParts = [];

        businessUnits.forEach(businessUnit => {
            // For each business unit, generate the union part
            // Note: Assuming businessUnit has a 'schemaPrefix' property
            const part = generateUnionAllQuery(ctx, '*', sourceSchemaSufix, `stg_${tableSufix}`, businessUnit, false);
            unionParts.push(part);
        });

        // Join all union parts with UNION ALL to form the complete query
        return unionParts.join(' UNION ALL ');
    }).preOps(`
        DECLARE schema_is_set BOOL DEFAULT FALSE;
    `).postOps(ctx => `
        ${createOrReplaceTableInplace(ctx, generateSchemaDefinition(ctx, columns), clusterBy)}
    `);
}

dimTables.forEach(dimTable => {
    publishDimTableFromStagingViews(dimTable);
});
