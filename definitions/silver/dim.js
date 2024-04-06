const {
    createOrReplaceTableInplace,
    generateSchemaDefinition
} = require('includes/schema.js');


const dimensions = [
    'advertiser', 'campaign', 'adset', 'coupon', 'creative',
    'category', 'channel', 'marketing_objective'
];

function publishDimTableFromStagingView(dimension) {
    const {
        columns,
        uniqueAssertion,
        nonNullAssertion
    } = require(`definitions/staging/dim/stg_${dimension}.js`);

    publish(`dim_${dimension}`, {
        type: 'table',
        schema: 'criteo_marketing',
        assertions: {
            uniqueKey: uniqueAssertion,
            nonNull: nonNullAssertion
        },
        bigquery: {
            clusterBy: ['advertiser_id']
        },
    }).query(ctx => `
        SELECT
            *
        FROM ${ctx.ref(`stg_${dimension}`)}
    `).preOps(`
        DECLARE schema_is_set BOOL DEFAULT FALSE;
    `).postOps(ctx => `
        ${createOrReplaceTableInplace(ctx, generateSchemaDefinition(ctx, columns))}
    `);
}

dimensions.forEach(dimension => {
    publishDimTableFromStagingView(dimension);
});
