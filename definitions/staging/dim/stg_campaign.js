const {
    sourceSchemaSuffix,
    businessUnits
} = require('config.js');
const {
    extractAttribute,
    generateUnionAllQuery,
} = require("includes/utils.js");
const {
    getNotNullColumns,
    getPrimaryKeys,
    generateSelectColumns
} = require('includes/schema.js');


// Campaign Attributes
const campaignName = extractAttribute('name');
const advertiserId = extractAttribute('advertiserId');
const goal = extractAttribute('goal');
const spendLimitAmount = `CAST(${extractAttribute('spendLimit.spendLimitAmount.value')} AS NUMERIC)`;
const spendLimitRenewal = extractAttribute('spendLimit.spendLimitRenewal');
const spendLimitType = extractAttribute('spendLimit.spendLimitType');

// Schema
const columns = (ctx) => [
    { name: 'id', type: 'STRING NOT NULL', constraints: [
        'PRIMARY KEY'] },
    { name: campaignName, type: 'STRING NOT NULL', alias: 'name' },
    { name: goal, type: 'STRING NOT NULL', alias: 'goal' },
    { name: spendLimitType, type: 'STRING', alias: 'spend_limit_type' },
    { name: spendLimitAmount, type: 'NUMERIC', alias: 'spend_limit_amount' },
    { name: spendLimitRenewal, type: 'STRING', alias: 'spend_limit_renewal' },
    { name: advertiserId, type: 'STRING NOT NULL', alias: 'advertiser_id', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY ${ctx.ref('dim_advertiser')}(id)`] },
];

const uniqueAssertion = getPrimaryKeys(columns);
const nonNullAssertion = getNotNullColumns(columns);


businessUnits.forEach(businessUnit => {
    publish('stg_campaign', {
        type: 'view',
        schema: `${businessUnit.schemaPreffix}_${sourceSchemaSuffix}`,
        assertions: {
            uniqueKey: uniqueAssertion,
            nonNull: nonNullAssertion
        },
        tags: ['staging', 'view', 'dim']
    }).query(ctx => generateUnionAllQuery(
        ctx, generateSelectColumns(ctx, columns),
        sourceSchemaSuffix, 'capaigns', businessUnit)
    )
})

module.exports = {
    columns,
    uniqueAssertion,
    nonNullAssertion
}
