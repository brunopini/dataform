const {
    sourceSchemaSuffix,
    businessUnits
} = require('config.js');
const {
    generateUnionAllQuery
} = require('includes/utils.js');
const {
    getNotNullColumns,
    getPrimaryKeys,
    generateSelectColumns,
} = require('includes/schema.js');
const {
    dimColumns
} = require('includes/stats.js');
const {
    metricColumns
} = require('includes/ngg.js');


const columns = (ctx) => dimColumns(ctx).concat(metricColumns);

const uniqueAssertion = getPrimaryKeys(columns);
const nonNullAssertion = getNotNullColumns(columns);


businessUnits.forEach(businessUnit => {
    // For each business unit, create a view.
    publish(`stg_stats_day_reach`, {
        type: 'view',
        schema: `${businessUnit.schemaPrefix}_${sourceSchemaSuffix}`,
        assertions: {
            uniqueKey: uniqueAssertion,
            nonNull: nonNullAssertion
        },
        tags: ['staging', 'view', 'ngg']
    }).query(ctx => generateUnionAllQuery( // Union all accounts per business unit.
        ctx, generateSelectColumns(ctx, columns),
        sourceSchemaSuffix, 'statistics_user_agg', businessUnit)
    )
});

module.exports = {
    columns,
    uniqueAssertion,
    nonNullAssertion
}
