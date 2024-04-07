const {
    sourceSchemaSufix,
    businessUnits
} = require('config.js');
const {
    extractAttribute,
    generateUnionAllQuery,
} = require('includes/utils.js');
const {
    generateSelectColumns,
    getNotNullColumns,
    getPrimaryKeys,
} = require('includes/schema.js');


// Ad Attributes
const adName = extractAttribute('name');
const inventoryType = extractAttribute('inventoryType');
const startDate = `CAST(${extractAttribute('startDate')} AS TIMESTAMP)`;
const endDate = `CAST(${extractAttribute('endDate')} AS TIMESTAMP)`;
const adDescription = extractAttribute('description');
const advertiserId = extractAttribute('advertiserId');
const adSetId = extractAttribute('adSetId');
const creativeId = extractAttribute('creativeId');

// Schema
const columns = (ctx) => [
    { name: 'id', type: 'STRING NOT NULL', constraints: [
        'PRIMARY KEY'] },
    { name: adName, type: 'STRING NOT NULL', alias: 'name' },
    { name: inventoryType, type: 'STRING NOT NULL', alias: 'inventory_type' },
    { name: startDate, type: 'TIMESTAMP', alias: 'start_date' },
    { name: endDate, type: 'TIMESTAMP', alias: 'end_date' },
    { name: adDescription, type: 'STRING', alias: 'description' },
    { name: advertiserId, type: 'STRING NOT NULL', alias: 'advertiser_id', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY ${ctx.ref('dim_advertiser')}(id)`] },
    { name: adSetId, type: 'STRING NOT NULL', alias: 'adset_id', constraints: [
        `FOREIGN KEY (advertiser_id) ${ctx.ref('dim_adset')}(id, advertiser_id)`] },
    { name: creativeId, type: 'STRING NOT NULL', alias: 'creative_id', constraints: [
        `FOREIGN KEY (advertiser_id) ${ctx.ref('dim_creative')}(id, advertiser_id)`] },
];

const uniqueAssertion = getPrimaryKeys(columns);
const nonNullAssertion = getNotNullColumns(columns);


businessUnits.forEach(businessUnit => {
    publish('stg_ad', {
        type: 'view',
        schema: `${businessUnit.schemaPrefix}_${sourceSchemaSufix}`,
        assertions: {
            uniqueKey: uniqueAssertion,
            nonNull: nonNullAssertion
        },
        tags: ['staging', 'view', 'dim']
    }).query(ctx => generateUnionAllQuery(
        ctx, generateSelectColumns(ctx, columns),
        sourceSchemaSufix, 'ads', businessUnit)
    )
})

module.exports = {
    columns,
    uniqueAssertion,
    nonNullAssertion
}
