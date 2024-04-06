const {
    extractAttribute,
} = require("includes/utils.js");
const {
    generateSelectStatement,
    getNotNullColumns,
    getPrimaryKeys,
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


publish('stg_campaign', {
    type: 'view',
    assertions: {
        uniqueKey: getPrimaryKeys(columns),
        nonNull: getNotNullColumns(columns)
    },
    tags: ['staging', 'view', 'dim']
}).query(ctx => `
    SELECT
        ${generateSelectStatement(ctx, columns)}
    FROM
        ${ctx.ref('campaigns')}
`)

module.exports = {
    columns
}
