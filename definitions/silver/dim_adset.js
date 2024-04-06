// const tableSuffix = 'adset';

// const {
//     columns,
//     uniqueAssertion,
//     nonNullAssertion
// } = require(`definitions/staging/dim/stg_${tableSuffix}.js`);
// const {
//     createOrReplaceTableInplace,
//     generateSchemaDefinition
// } = require('includes/schema.js');


// publish(`dim_${tableSuffix}`, {
//     type: 'table',
//     schema: 'criteo_marketing',
//     assertions: {
//         uniqueKey: uniqueAssertion,
//         nonNull: nonNullAssertion
//     },
//     bigquery: {},
// }).query(ctx => `
//     SELECT
//         *
//     FROM ${ctx.ref(`stg_${tableSuffix}`)}
// `).preOps(`
//     DECLARE schema_is_set BOOL DEFAULT FALSE;
// `).postOps(ctx => `
//     ${createOrReplaceTableInplace(ctx, generateSchemaDefinition(ctx, columns))}
// `);
