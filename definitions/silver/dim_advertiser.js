const {
    columns,
    uniqueAssertion,
    nonNullAssertion
} = require('definitions/staging/dim/stg_advertiser.js');
const {
    createOrReplaceTableInplace,
    generateSchemaDefinition
} = require('includes/schema.js');


publish('dim_advertiser', {
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
    FROM ${ctx.ref('stg_advertiser')}
`).preOps(`
    DECLARE schema_is_set BOOL DEFAULT FALSE;
`).postOps(ctx => `
    ${createOrReplaceTableInplace(ctx, generateSchemaDefinition(ctx, columns))}
`);
