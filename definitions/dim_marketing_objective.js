const {
    simpleDimSchema,
    createOrReplaceTable
} = require('includes/schema.js');

// Consts
const primaryKey = ['id'];
const dimEntitySource = 'MarketingObjective'

// Config
const bigqueryConfig = {};
const assertionsConfig = {
    uniqueKey: primaryKey,
    nonNull: ['id', 'name']
};

// Table names
const targetTable = 'dim_marketing_objective';
const sourceTable = 'statistics_pre_click';

// Static
publish(targetTable, {
    type: 'table',
    assertions: assertionsConfig,
    bigquery: bigqueryConfig,
}).query(ctx => `
  SELECT
    DISTINCT ${dimEntitySource}Id AS id,
    ${dimEntitySource} AS name,
  FROM
    ${ctx.ref(sourceTable)}
`).preOps(ctx => `
  DECLARE schema_is_set BOOL DEFAULT FALSE;
`).postOps(ctx => `${createOrReplaceTable(ctx.self(), simpleDimSchema(primaryKey))}`);
