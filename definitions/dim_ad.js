const {
    dimPrimaryKey,
    extractAttribute,
} = require("includes/utils.js");
const {
    createOrReplaceTable
} = require('includes/schema.js');

// Config
const bigqueryConfig = {};
const assertionsConfig = {
    uniqueKey: dimPrimaryKey,
    nonNull: ["id", "type", "inventory_type", "creative_id", "adset_id"]
};

// Table names
const targetTable = 'dim_ad';
const sourceTable = 'ads';

// Ad Attributes
const adSetId = extractAttribute('adSetId');
const creativeId = extractAttribute('creativeId');
const adDescription = extractAttribute('description');
const endDate = extractAttribute('endDate');
const inventoryType = extractAttribute('inventoryType');
const adName = extractAttribute('name');
const startDate = extractAttribute('startDate');
const advertiserId = extractAttribute('advertiserId');

// Columns
const columnsSelect = `
    id,
    type,
    ${adName} AS name,
    ${inventoryType} AS inventory_type,
    ${adDescription} AS description,
    CAST(${startDate} AS TIMESTAMP) AS start_date,
    CAST(${endDate} AS TIMESTAMP) AS end_date,
    ${creativeId} AS creative_id,
    ${adSetId} AS adset_id,
    ${advertiserId} AS advertiser_id,
`;
const schema = (ctx) => `
id STRING NOT NULL,
type STRING NOT NULL,
name STRING NOT NULL,
inventory_type STRING NOT NULL,
description STRING,
start_date TIMESTAMP,
end_date TIMESTAMP,
creative_id STRING NOT NULL,
adset_id STRING NOT NULL,
advertiser_id STRING NOT NULL REFERENCES ${ctx.ref('dim_advertiser')}(id) NOT ENFORCED,
PRIMARY KEY (${dimPrimaryKey}) NOT ENFORCED,
FOREIGN KEY (creative_id, advertiser_id) REFERENCES ${ctx.ref('dim_creative')}(id, advertiser_id) NOT ENFORCED,
FOREIGN KEY (adset_id, advertiser_id) REFERENCES ${ctx.ref('dim_adset')}(id, advertiser_id) NOT ENFORCED,
`;

// Static
publish(targetTable, {
    type: 'table',
    assertions: assertionsConfig,
    bigquery: bigqueryConfig,
}).query(ctx => `
    SELECT ${columnsSelect}
    FROM ${ctx.ref(sourceTable)}
`).preOps(ctx => `
  DECLARE schema_is_set BOOL DEFAULT FALSE;
`).postOps(ctx => `${createOrReplaceTable(ctx.self(), schema(ctx))}`);
