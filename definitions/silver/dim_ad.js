const {
    columns,
    uniqueAssertion,
    nonNullAssertion
} = require("definitons/staging/dim/stg_ad.js");
const {
    createOrReplaceTable,
    generateSelectStatement,
    generateSchemaDefinition
} = require('includes/schema.js');


publish('dim_ad', {
    type: 'table',
    assertions: {
        uniqueKey: uniqueAssertion,
        nonNull: nonNullAssertion
    },
    bigquery: {},
}).query(ctx => `
    SELECT ${generateSelectStatement(ctx, columns)}
    FROM ${ctx.ref('stg_ad')}
`).preOps(ctx => `
  DECLARE schema_is_set BOOL DEFAULT FALSE;
`).postOps(ctx => `${createOrReplaceTable(ctx.self(), generateSchemaDefinition(ctx, columns))}`);
