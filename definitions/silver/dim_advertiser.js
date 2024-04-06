const {
    columns,
    uniqueAssertion,
    nonNullAssertion
} = require('definitions/staging/dim/stg_advertiser.js');
const {
    createOrReplaceTable,
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
`).preOps(ctx => `
  DECLARE schema_is_set BOOL DEFAULT FALSE;
`).postOps(ctx => `${createOrReplaceTable(ctx.self(), generateSchemaDefinition(ctx, columns))}`);
