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


// Creative Attributes
const creativeName = extractAttribute('name');
const format = extractAttribute('format');
const author = extractAttribute('author');
const creativeStatus = extractAttribute('status');
const advertiserId = extractAttribute('advertiserId');
const creativeDescription = extractAttribute('description');
const datasetId = extractAttribute('datasetId');
const landingPageUrl = extractAttribute('imageAttributes.landingPageUrl');
const imageUrls = extractArrayAttribute('imageAttributes.urls');

// Schema
const columns = (ctx) => [
    { name: 'id', type: 'STRING NOT NULL', constraints: [
        'PRIMARY KEY'] },
    { name: creativeName, type: 'STRING NOT NULL', alias: 'name' },
    { name: creativeStatus, type: 'STRING NOT NULL', alias: 'status' },
    { name: format, type: 'STRING NOT NULL', alias: 'format' },
    { name: author, type: 'STRING NOT NULL', alias: 'author' },
    { name: creativeDescription, type: 'STRING', alias: 'description' },
    { name: landingPageUrl, type: 'ARRAY<STRING>', alias: 'lp_urls' },
    { name: imageUrls, type: 'ARRAY<STRING>', alias: 'image_urls' },
    { name: datasetId, type: 'STRING NOT NULL', alias: 'dataset_id' },
    { name: advertiserId, type: 'STRING NOT NULL', alias: 'advertiser_id', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY ${ctx.ref('dim_advertiser')}(id)`] },
];

const uniqueAssertion = getPrimaryKeys(columns);
const nonNullAssertion = getNotNullColumns(columns);


businessUnits.forEach(businessUnit => {
    publish('stg_creative', {
        type: 'view',
        schema: `${businessUnit.schemaPreffix}_${sourceSchemaSuffix}`,
        assertions: {
            uniqueKey: uniqueAssertion,
            nonNull: nonNullAssertion
        },
        tags: ['staging', 'view', 'dim']
    }).query(ctx => generateUnionAllQuery(
        ctx, generateSelectColumns(ctx, columns),
        sourceSchemaSuffix, 'creatives', businessUnit)
    )
})

module.exports = {
    columns,
    uniqueAssertion,
    nonNullAssertion
}
