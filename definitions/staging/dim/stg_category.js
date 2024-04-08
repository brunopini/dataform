const {
  sourceSchemaSuffix,
  businessUnits
} = require('config.js');
const {
  generateUnionAllQuery,
} = require('includes/utils.js');
const {
  simpleDimColumns,
  getNotNullColumns,
  getPrimaryKeys,
  generateSelectColumns
} = require('includes/schema.js');


const columns = simpleDimColumns('Category');

const uniqueAssertion = getPrimaryKeys(columns);
const nonNullAssertion = getNotNullColumns(columns);


businessUnits.forEach(businessUnit => {
  // For each business unit, create a view.
  publish('stg_category', {
    type: 'view',
    schema: `${businessUnit.schemaPrefix}_${sourceSchemaSuffix}`,
    assertions: {
        uniqueKey: uniqueAssertion,
        nonNull: nonNullAssertion
    },
    tags: ['staging', 'view', 'dim']
  }).query(ctx => generateUnionAllQuery( // Union all accounts per business unit.
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
