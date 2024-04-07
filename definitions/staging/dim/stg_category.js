const {
  sourceSchemaSuffix,
  businessUnits
} = require('config.js')
const {
  simpleDimColumns,
  getNotNullColumns,
  getPrimaryKeys,
} = require('includes/schema.js');


const columns = simpleDimColumns('Category');


businessUnits.forEach(businessUnit => {
  publish('stg_category', {
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
