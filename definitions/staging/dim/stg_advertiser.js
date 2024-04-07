const {
  sourceSchemaSufix,
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


const columns = simpleDimColumns('Advertiser');

const uniqueAssertion = getPrimaryKeys(columns);
const nonNullAssertion = getNotNullColumns(columns);


businessUnits.forEach(businessUnit => {
  publish('stg_advertiser', {
    type: 'view',
    schema: `${businessUnit.schemaPrefix}_${sourceSchemaSufix}`,
    assertions: {
        uniqueKey: uniqueAssertion,
        nonNull: nonNullAssertion
    },
    tags: ['staging', 'view', 'dim']
  }).query(ctx => generateUnionAllQuery(
    ctx, generateSelectColumns(ctx, columns),
    sourceSchemaSufix, 'statistics_pre_click', businessUnit, true, true)
    // true for account level union (default) and for distinct select ^
  )
})

module.exports = {
  columns,
  uniqueAssertion,
  nonNullAssertion
}
