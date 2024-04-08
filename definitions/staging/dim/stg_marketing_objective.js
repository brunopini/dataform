const {
  sourceSchemaSuffix,
  businessUnits
} = require('config.js');
const {
  generateUnionAllQuery,
} = require('includes/utils.js');
const {
  generateSelectColumns,
  simpleDimColumns,
  getNotNullColumns,
  getPrimaryKeys,
} = require('includes/schema.js');


const columns = simpleDimColumns('MarketingObjective');

const uniqueAssertion = getPrimaryKeys(columns);
const nonNullAssertion = getNotNullColumns(columns);


businessUnits.forEach(businessUnit => {
  publish('stg_marketing_objective', {
    type: 'view',
    schema: `${businessUnit.schemaPrefix}_${sourceSchemaSuffix}`,
    assertions: {
        uniqueKey: uniqueAssertion,
        nonNull: nonNullAssertion
    },
    tags: ['staging', 'view', 'dim']
  }).query(ctx => generateUnionAllQuery(
    ctx, generateSelectColumns(ctx, columns),
    sourceSchemaSuffix, 'statistics_pre_click', businessUnit, true, true)
    // true for account level union (default) and for distinct select ^
  )
})

module.exports = {
  columns,
  uniqueAssertion,
  nonNullAssertion
}
