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
  
  
  const columns = simpleDimColumns('ad').concat([
    { name: 'app_id', type: 'STRING NOT NULL', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY ${ctx.ref(targetSchemaSuffix, 'dim_app')}(id)`] }
  ]);
  
  const uniqueAssertion = getPrimaryKeys(columns);
  const nonNullAssertion = getNotNullColumns(columns);
  
  
  businessUnits.forEach(businessUnit => {
    // For each business unit, create a view.
    publish('stg_ad', {
      type: 'view',
      schema: `${businessUnit.schemaPrefix}_${sourceSchemaSuffix}`,
      assertions: {
          uniqueKey: uniqueAssertion,
          nonNull: nonNullAssertion
      },
      tags: ['staging', 'view', 'dim']
    }).query(ctx => generateUnionAllQuery( // Union all accounts per business unit.
      ctx, generateSelectColumns(ctx, columns),
      sourceSchemaSuffix, 'ad_set_reports_stream', businessUnit, true, true)
      // true for account level union (default) and for distinct select ^
    )
  })
  
  module.exports = {
    columns,
    uniqueAssertion,
    nonNullAssertion
  }
  