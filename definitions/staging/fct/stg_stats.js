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


const columns = (ctx) => dimColumns(ctx, 't0.').concat([
  { name: 'CAST(total_spend AS NUMERIC)', type: 'NUMERIC' },
  { name: 'CAST(spend AS NUMERIC)', type: 'NUMERIC' },
  { name: 'CAST(impressions AS NUMERIC)', type: 'NUMERIC' },
  { name: 'CAST(clicks AS NUMERIC)', type: 'NUMERIC' },
  { name: 'CAST(tracker_installs AS NUMERIC)', type: 'NUMERIC' },
  { name: 'CAST(tracker_installs AS NUMERIC)', type: 'NUMERIC' },
  { name: 'CAST(unique_events_d3 AS NUMERIC)', type: 'NUMERIC' },
  { name: 'CAST(unique_events_d30 AS NUMERIC)', type: 'NUMERIC' },
  { name: 'CAST(fee AS NUMERIC)', type: 'NUMERIC' },
])

const uniqueAssertion = getPrimaryKeys(columns);
const nonNullAssertion = getNotNullColumns(columns);


businessUnits.forEach(businessUnit => {
  // For each business unit, create a view.
  publish('stg_stats', {
      type: 'view',
      schema: `${businessUnit.schemaPrefix}_${sourceSchemaSuffix}`,
      assertions: {
          uniqueKey: uniqueAssertion,
          nonNull: nonNullAssertion
      },
      tags: ['staging', 'view', 'fct']
  }).query(ctx => generateUnionAllQuery( // Union all apps per business unit.
      ctx, generateSelectColumns(ctx, columns),
      sourceSchemaSuffix, 'ad_set_reports_stream', businessUnit)
  )
})

module.exports = {
  columns,
  uniqueAssertion,
  nonNullAssertion
}
