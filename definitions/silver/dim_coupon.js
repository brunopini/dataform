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
    nonNull: ["id", "type", "adset_id", "name", "format", "status", "advertiser_id"]
};

// Table names
const targetTable = 'dim_coupon';
const sourceTable = 'coupons';

// Coupon Attributes
const showEvery = extractAttribute('showEvery');
const images = extractArrayAttribute('images');
const author = extractAttribute('author');
const couponName = extractAttribute('name');
const format = extractAttribute('format');
const adSetId = extractAttribute('adSetId');
const rotationNumbers = extractAttribute('rotationsNumber');
const showDuration = extractAttribute('showDuration');
const landingPageUrl = extractAttribute('landingPageUrl');
const couponStatus = extractAttribute('status');
const advertiserId = extractAttribute('advertiserId');

// Columns
const columnsSelect = `
    id,
    type,
    ${couponName} AS name,
    ${images} AS images,
    ${adSetId} AS adset_id,
    ${author} AS author,
    ${format} AS format,
    ${showEvery} AS show_every,
    ${rotationNumbers} AS rotation_number,
    ${showDuration} AS show_duration,
    ${landingPageUrl} AS lp_url,
    ${couponStatus} AS status,
    ${advertiserId} AS advertiser_id,
`;
const schema = (ctx) => `
id STRING NOT NULL,
type STRING NOT NULL,
name STRING NOT NULL,
images ARRAY<STRING>,
adset_id STRING NOT NULL,
author STRING,
format STRING NOT NULL,
show_every STRING,
rotation_number STRING,
show_duration STRING,
lp_url STRING,
status STRING NOT NULL,
advertiser_id STRING NOT NULL,
PRIMARY KEY (${dimPrimaryKey}) NOT ENFORCED,
FOREIGN KEY (adset_id, advertiser_id) REFERENCES ${ctx.ref('dim_adset')}(id, advertiser_id) NOT ENFORCED,
FOREIGN KEY (id) REFERENCES ${ctx.ref('dim_advertiser')}(id) NOT ENFORCED,
`;

// Static
publish(targetTable, {
    type: 'table',
    assertions: assertionsConfig,
    bigquery: bigqueryConfig
}).query(ctx => `
    SELECT ${columnsSelect}
    FROM ${ctx.ref(sourceTable)}
`).preOps(ctx => `
  DECLARE schema_is_set BOOL DEFAULT FALSE;
`).postOps(ctx => `
    ${createOrReplaceTable(ctx.self(),
        schema(ctx)
    )}
`)
