const {
  sourceSchemaSuffix,
  businessUnits
} = require('config.js')
const {
  simpleDimColumns,
  getNotNullColumns,
  getPrimaryKeys,
} = require('includes/schema.js');


const columns = simpleDimColumns('Channel');


businessUnits.forEach(businessUnit => {
  publish('stg_channel', {
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
