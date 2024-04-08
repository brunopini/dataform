const {
    sourceSchemaSuffix,
    businessUnits
} = require('config.js');
const {
    generateUnionAllQuery,
} = require("includes/utils.js");
const {
    getNotNullColumns,
    getPrimaryKeys,
    generateSelectColumns
} = require('includes/schema.js');
const {
    columns
} = require('includes/reach.js');


const entity = 'Adset'
const timeframe = 'Month'

columns = baseColumns;

const uniqueAssertion = getPrimaryKeys(columns);
const nonNullAssertion = getNotNullColumns(columns);


businessUnits.forEach(businessUnit => {
    entityTableComponent = entity.toLocaleLowerCase();
    timeframeTableComponent = timeframe.toLocaleLowerCase()
    selectColumns = columns(ctx, entity, timeframe);
    publish(`stg_${entityTableComponent}_${timeframeTableComponent}_reach`, {
        type: 'view',
        schema: `${businessUnit.schemaPrefix}_${sourceSchemaSuffix}`,
        assertions: {
            uniqueKey: uniqueAssertion,
            nonNull: nonNullAssertion
        },
        tags: ['staging', 'view', 'ngg']
    }).query(ctx => generateUnionAllQuery(
        ctx, generateSelectColumns(ctx, selectColumns),
        sourceSchemaSuffix, `user_agg_${entityTableComponent}_${timeframeTableComponent}`, businessUnit)
    )
})

module.exports = {
    columns,
    uniqueAssertion,
    nonNullAssertion
}
