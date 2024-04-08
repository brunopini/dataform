const {
    sourceSchemaSuffix,
    businessUnits
} = require('config.js');
const {
    extractAttribute,
    extractArrayAttribute,
    generateUnionAllQuery,
} = require('includes/utils.js');
const {
    getNotNullColumns,
    getPrimaryKeys,
    generateSelectColumns
} = require('includes/schema.js');


// Coupon Attributes
const couponName = extractAttribute('name');
const couponStatus = extractAttribute('status');
const format = extractAttribute('format');
const author = extractAttribute('author');
const showEvery = `CAST(${extractAttribute('showEvery')} AS NUMERIC)`;
const showDuration = `CAST(${extractAttribute('showDuration')} AS NUMERIC)`;
const rotationNumber = `CAST(${extractAttribute('rotationsNumber')} AS NUMERIC)`;
const landingPageUrl = extractAttribute('landingPageUrl');
const images = extractArrayAttribute('images');
const adSetId = extractAttribute('adSetId');
const advertiserId = extractAttribute('advertiserId');

// Schema
const columns = (ctx) => [
    { name: 'id', type: 'STRING NOT NULL', constraints: [
        'PRIMARY KEY'] },
    { name: couponName, type: 'STRING NOT NULL', alias: 'name' },
    { name: couponStatus, type: 'STRING NOT NULL', alias: 'status' },
    { name: format, type: 'STRING NOT NULL', alias: 'format' },
    { name: author, type: 'STRING', alias: 'author' },
    { name: showEvery, type: 'NUMERIC', alias: 'show_every' },
    { name: showDuration, type: 'NUMERIC', alias: 'show_duration' },
    { name: rotationNumber, type: 'NUMERIC', alias: 'rotation_numer' },
    { name: landingPageUrl, type: 'STRING', alias: 'lp_url' },
    { name: images, type: 'ARRAY<STRING>', alias: 'images' },
    { name: adSetId, type: 'STRING NOT NULL', alias: 'adset_id', constraints: [
        `FOREIGN KEY (advertiser_id) ${ctx.ref('dim_adset')}(id, advertiser_id)`]},
    { name: advertiserId, type: 'STRING NOT NULL', alias: 'advertiser_id', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY ${ctx.ref('dim_advertiser')}(id)`] },
];

const uniqueAssertion = getPrimaryKeys(columns);
const nonNullAssertion = getNotNullColumns(columns);


businessUnits.forEach(businessUnit => {
    // For each business unit, create a view.
    publish('stg_coupon', {
        type: 'view',
        schema: `${businessUnit.schemaPrefix}_${sourceSchemaSuffix}`,
        assertions: {
            uniqueKey: uniqueAssertion,
            nonNull: nonNullAssertion
        },
        tags: ['staging', 'view', 'dim']
    }).query(ctx => generateUnionAllQuery( // Union all accounts per business unit.
        ctx, generateSelectColumns(ctx, columns),
        sourceSchemaSuffix, 'coupons', businessUnit)
    )
})

module.exports = {
    columns,
    uniqueAssertion,
    nonNullAssertion
}
