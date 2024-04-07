const {
    businessUnits
} = require('config.js');
const {
    createOrReplaceTableInplace,
    generateSchemaDefinition
} = require('includes/schema.js');
const {
    generateUnionAllQuery
} = require('includes/utils.js');


const dimensions = [
    'advertiser', 'campaign', 'adset', 'coupon', 'creative',
    'category', 'channel', 'marketing_objective'
];

function publishDimTableFromStagingViews(dimension, businessUnits) {
    const {
        columns,
        uniqueAssertion,
        nonNullAssertion
    } = require(`definitions/staging/dim/stg_${dimension}.js`);

    // Assume businessUnits is an array of business unit objects, each with schemaPrefix property
    publish(`dim_${dimension}`, {
        type: 'table',
        assertions: {
            uniqueKey: uniqueAssertion,
            nonNull: nonNullAssertion
        },
        bigquery: {
            clusterBy: ['advertiser_id']
        },
    }).query(ctx => {
        // Create an array to hold the union parts for each business unit
        let unionParts = [];

        businessUnits.forEach(businessUnit => {
            // For each business unit, generate the union part
            // Note: Assuming businessUnit has a 'schemaPrefix' property
            const part = generateUnionAllQuery(ctx, '*', `stg_${dimension}`, `stg_${dimension}`, businessUnit, false);
            unionParts.push(part);
        });

        // Join all union parts with UNION ALL to form the complete query
        return unionParts.join(" UNION ALL ");
    }).preOps(`
        DECLARE schema_is_set BOOL DEFAULT FALSE;
    `).postOps(ctx => `
        ${createOrReplaceTableInplace(ctx, generateSchemaDefinition(ctx, columns))}
    `);
}

dimensions.forEach(dimension => {
    publishDimTableFromStagingViews(dimension, businessUnits);
});
