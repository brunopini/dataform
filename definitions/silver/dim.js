const {
    createOrReplaceTableInplace,
    generateSchemaDefinition
} = require('includes/schema.js');


const dimensionSuffixes = ['advertiser', 'campaign', 'adset'];

// Function that encapsulates your logic
function processTableSuffix(tableSuffix) {
    const {
        columns,
        uniqueAssertion,
        nonNullAssertion
    } = require(`definitions/staging/dim/stg_${tableSuffix}.js`);

    publish(`dim_${tableSuffix}`, {
        type: 'table',
        schema: 'criteo_marketing',
        assertions: {
            uniqueKey: uniqueAssertion,
            nonNull: nonNullAssertion
        },
        bigquery: {},
    }).query(ctx => `
        SELECT
            *
        FROM ${ctx.ref(`stg_${tableSuffix}`)}
    `).preOps(`
        DECLARE schema_is_set BOOL DEFAULT FALSE;
    `).postOps(ctx => `
        ${createOrReplaceTableInplace(ctx, generateSchemaDefinition(ctx, columns))}
    `);
}

// Iterate over each item in the dimensionSuffixes array
dimensionSuffixes.forEach(suffix => {
    processTableSuffix(suffix);
});
