const {
    simpleDimColumns,
    generateSelectStatement,
    getNotNullColumns,
    getPrimaryKeys,
} = require('includes/schema.js');


const columns = simpleDimColumns('Advertiser');


publish('stg_advertiser', {
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
