const {
    sourceSchemaSuffix,
    businessUnits
} = require('config.js');
const {
    generateUnionAllQuery,
    mockCtx,
} = require("includes/utils.js");
const {
    getNotNullColumns,
    getPrimaryKeys,
    generateSelectColumns
} = require('includes/schema.js');
const {
    columns
} = require('includes/ngg.js');


const entity = 'Adset';
const timeframe = 'Month';

mockColumns = columns(mockCtx, entity, timeframe);

const uniqueAssertion = getPrimaryKeys(mockColumns);
const nonNullAssertion = getNotNullColumns(mockColumns);


businessUnits.forEach(businessUnit => {
    const entityTableComponent = entity.toLowerCase();
    const timeframeTableComponent = timeframe.toLowerCase();
    // For each business unit, create a view.
    publish(`stg_${entityTableComponent}_${timeframeTableComponent}_reach`, {
        type: 'view',
        schema: `${businessUnit.schemaPrefix}_${sourceSchemaSuffix}`,
        assertions: {
            uniqueKey: uniqueAssertion,
            nonNull: nonNullAssertion
        },
        tags: ['staging', 'view', 'ngg']
    }).query(ctx => generateUnionAllQuery( // Union all accounts per business unit.
        ctx, generateSelectColumns(ctx, columns(ctx, entity, timeframe)),
        sourceSchemaSuffix, `user_agg_${entityTableComponent}_${timeframeTableComponent}`, businessUnit)
    )
})

module.exports = {
    columns,
    uniqueAssertion,
    nonNullAssertion
}
