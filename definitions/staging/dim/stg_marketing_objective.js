const {
  simpleDimColumns,
  generateSelectStatement,
  getNotNullColumns,
  getPrimaryKeys,
} = require('includes/schema.js');


const columns = simpleDimColumns('MarketingObjective');


publish('stg_marketing_objective', {
  type: 'view',
  assertions: {
      uniqueKey: getPrimaryKeys(columns),
      nonNull: getNotNullColumns(columns)
  },
  tags: ['staging', 'view', 'dim']
}).query(ctx => `
SELECT
  DISTINCT ${generateSelectStatement(ctx, columns)}
FROM
  ${ctx.ref('statistics_pre_click')}
`)

module.exports = {
columns
}
