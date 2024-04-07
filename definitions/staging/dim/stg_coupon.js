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
const showEvery = extractAttribute('showEvery');
const showDuration = extractAttribute('showDuration');
const rotationNumber = extractAttribute('rotationsNumber');
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
    { name: landingPageUrl, type: 'NUMERIC', alias: 'lp_url' },
    { name: images, type: 'ARRAY<>STRING', alias: 'images' },
    { name: adSetId, type: 'STRING NOT NULL', alias: 'adset_id', constraints: [
        `FOREIGN KEY (advertiser_id) ${ctx.ref('dim_adset')}(id, advertiser_id)`]},
    { name: advertiserId, type: 'STRING NOT NULL', alias: 'advertiser_id', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY ${ctx.ref('dim_advertiser')}(id)`] },
];


businessUnits.forEach(businessUnit => {
    publish('stg_coupon', {
        type: 'view',
        schema: `${businessUnit.schemaPreffix}_${sourceSchemaSuffix}`,
        assertions: {
            uniqueKey: getPrimaryKeys(columns),
            nonNull: getNotNullColumns(columns)
        },
        tags: ['staging', 'view', 'dim']
    }).query(ctx => generateUnionAllQuery(
        ctx, generateSelectColumns(ctx, columns),
        sourceSchemaSuffix, 'ads', businessUnit)
    )
})

module.exports = {
    columns
}
