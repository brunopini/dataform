const {
    dimPrimaryKey,
    extractAttribute,
    extractArrayAttribute,
} = require("includes/utils.js");
const {
    createOrReplaceTable
} = require('includes/schema.js');

// Config
const bigqueryConfig = {};
const assertionsConfig = {
    uniqueKey: dimPrimaryKey,
    nonNull: ["id", "type", "dataset_id", "name", "format", "status", "advertiser_id"]
};

// Table names
const targetTable = 'dim_creative';
const sourceTable = 'creatives';

// Creative Attributes
const author = extractAttribute('author');
const creativeName = extractAttribute('name');
const format = extractAttribute('format');
const creativeStatus = extractAttribute('status');
const advertiserId = extractAttribute('advertiserId');
const creativeDescription = extractAttribute('description');
const datasetId = extractAttribute('datasetId');
const landingPageUrl = extractAttribute('imageAttributes.landingPageUrl');
const imageUrls = extractArrayAttribute('imageAttributes.urls');

// Columns
const columnsSelect = `
    id,
    type,
    ${datasetId} AS dataset_id,
    ${creativeName} AS name,
    ${author} AS author,
    ${format} AS format,
    ${creativeStatus} AS status,
    ${creativeDescription} AS description,
    ${advertiserId} AS advertiser_id,
    ${landingPageUrl} AS lp_url,
    ${imageUrls} AS image_urls,
`;
const schema = (ctx) => `
id STRING NOT NULL,
type STRING NOT NULL,
dataset_id STRING NOT NULL,
name STRING NOT NULL,
author STRING,
format STRING NOT NULL,
status STRING NOT NULL,
description STRING,
advertiser_id STRING NOT NULL
    REFERENCES ${ctx.ref('dim_advertiser')}(id) NOT ENFORCED,
lp_url STRING,
image_urls ARRAY<STRING>,
PRIMARY KEY (${dimPrimaryKey}) NOT ENFORCED
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
