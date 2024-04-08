const {
    businessUnits,
    sourceSchemaSufix,
} = require('config.js');
const {
    createOrReplaceTableInplace,
    generateSchemaDefinition
} = require('includes/schema.js');
const {
    generateUnionAllQuery,
    lookBackDate
} = require('includes/utils.js');


const fctTables = [
    {
        sufix: 'stats',
        partitionBy: 'date',
        clusterBy: ['advertiser_id', 'campaign_id', 'adset_id', 'ad_id']
    },
];


function publishFctTableFromStagingViews(fctTable) {
    const tableSufix = fctTable.sufix;
    const {
        columns,
        uniqueAssertion,
        nonNullAssertion
    } = require(`definitions/staging/fct/stg_${tableSufix}.js`);

    const partitionBy = fctTable.partitionBy;
    const clusterBy = fctTable.clusterBy;

    // Assume businessUnits is an array of business unit objects, each with schemaPrefix property
    publish(`fct_${tableSufix}`, {
        type: 'incremental',
        uniqueKey: uniqueAssertion,
        assertions: {
            uniqueKey: uniqueAssertion,
            nonNull: nonNullAssertion
        },
        bigquery: {
            clusterBy: clusterBy,
            partitionBy: partitionBy,
            updatePartitionFilter: `${partitionBy} >= ${lookBackDate('CURRENT_TIMESTAMP()')}`
        },
        tags: ['silver', 'table', 'fct', 'incremental']
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
    }).preOps(ctx => `
        DECLARE insert_date_checkpoint DEFAULT (
        ${
            ctx.when(ctx.incremental(),
                `SELECT ${lookBackDate(`MAX(${partitionBy})`)} FROM ${ctx.self()}`,
                `SELECT DATE('2000-01-01')`)
        }
        );
        DECLARE schema_is_set BOOL DEFAULT FALSE;
    `).postOps(ctx => `
        ${createOrReplaceTableInplace(ctx, generateSchemaDefinition(ctx, columns), clusterBy, partitionBy)}
    `);
}

fctTables.forEach(fctTable => {
    publishFctTableFromStagingViews(fctTable)
})
