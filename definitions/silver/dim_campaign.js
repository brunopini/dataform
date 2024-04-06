// const {
//     dimPrimaryKey,
//     extractAttribute,
// } = require("includes/utils.js");
// const {
//     createOrReplaceTable
// } = require('includes/schema.js');

// // Config
// const bigqueryConfig = {};
// const assertionsConfig = {
//     uniqueKey: dimPrimaryKey,
//     nonNull: ["id", "type", "name", "goal", "advertiser_id"]
// };

// // Table names
// const targetTable = 'dim_campaign';
// const sourceTable = 'campaigns';

// // Campaign Attributes
// const campaignName = extractAttribute('name');
// const advertiserId = extractAttribute('advertiserId');
// const goal = extractAttribute('goal');
// const spendLimitAmount = extractAttribute('spendLimit.spendLimitAmount.value');
// const spendLimitRenewal = extractAttribute('spendLimit.spendLimitRenewal');
// const spendLimitType = extractAttribute('spendLimit.spendLimitType');

// // Columns
// const columnsSelect = `
//     id,
//     type,
//     ${campaignName} AS name,
//     ${advertiserId} AS advertiser_id,
//     ${goal} AS goal,
//     CAST(${spendLimitAmount} AS NUMERIC) AS spend_limit_amount,
//     ${spendLimitRenewal} AS spend_limit_renewal,
//     ${spendLimitType} AS spend_limit_type,
// `;
// const schema = (ctx) => `
// id STRING NOT NULL,
// type STRING NOT NULL,
// name STRING NOT NULL,
// advertiser_id STRING NOT NULL
//     REFERENCES ${ctx.ref('dim_advertiser')}(id) NOT ENFORCED,
// goal STRING NOT NULL,
// spend_limit_amount NUMERIC,
// spend_limit_renewal STRING,
// spend_limit_type STRING,
// PRIMARY KEY (${dimPrimaryKey}) NOT ENFORCED
// `;

// // Static
// publish(targetTable, {
//     type: 'table',
//     assertions: assertionsConfig,
//     bigquery: bigqueryConfig,
// }).query(ctx => `
//     SELECT ${columnsSelect}
//     FROM ${ctx.ref(sourceTable)}
// `).preOps(ctx => `
//   DECLARE schema_is_set BOOL DEFAULT FALSE;
// `).postOps(ctx => `${createOrReplaceTable(ctx.self(), schema(ctx))}`);
