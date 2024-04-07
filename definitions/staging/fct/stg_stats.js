const {
  sourceSchemaSuffix,
  businessUnits
} = require('config.js');
const {
  joinOn,
} = require('includes/utils.js');
const {
  getNotNullColumns,
  getPrimaryKeys,
  generateSelectColumns,
} = require('includes/schema.js');
const {
  baseColumns
} = require('includes/stats.js');


const columns = (ctx) => baseColumns(ctx).concat([
  { name: 'CAST(dlv.AdvertiserCost AS NUMERIC)', type: 'NUMERIC', alias: 'advertiser_cost' },
  { name: 'CAST(dlv.Clicks AS NUMERIC)', type: 'NUMERIC', alias: 'clicks' },
  { name: 'CAST(dlv.Displays AS NUMERIC)', type: 'NUMERIC', alias: 'displays' },
  { name: 'CAST(dlv.NonViewableDisplays AS NUMERIC)', type: 'NUMERIC', alias: 'non_viewable_displays' },
  { name: 'CAST(dlv.PotentialDisplays AS NUMERIC)', type: 'NUMERIC', alias: 'potential_displays' },
  { name: 'CAST(dlv.UntrackableDisplays AS NUMERIC)', type: 'NUMERIC', alias: 'untrackable_displays' },
  { name: 'CAST(dlv.ViewableDisplays AS NUMERIC)', type: 'NUMERIC', alias: 'viewable_displays' },
  { name: 'CAST(app.AppInstalls AS NUMERIC)', type: 'NUMERIC', alias: 'app_installs' },
  { name: 'CAST(app.PostInstallSales AS NUMERIC)', type: 'NUMERIC', alias: 'post_install_sales' },
  { name: 'CAST(app.PostInstallOrderValue AS NUMERIC)', type: 'NUMERIC', alias: 'post_install_order_value' },
  { name: 'CAST(crt.AverageCartAllClientAttribution AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_all_client_attribution' },
  { name: 'CAST(crt.AverageCartAllPc1d AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_all_pc1d' },
  { name: 'CAST(crt.AverageCartAllPc7d AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_all_pc7d' },
  { name: 'CAST(crt.AverageCartAllPc30d AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_all_pc30d' },
  { name: 'CAST(crt.AverageCartAllPc30dPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_all_pc30d_pv24h' },
  { name: 'CAST(crt.AverageCartAllPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_all_pv24h' },
  { name: 'CAST(crt.AverageCartClientAttribution AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_client_attribution' },
  { name: 'CAST(crt.AverageCartPc1d AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_pc1d' },
  { name: 'CAST(crt.AverageCartPc7d AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_pc7d' },
  { name: 'CAST(crt.AverageCartPc30d AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_pc30d' },
  { name: 'CAST(crt.AverageCartPc30dPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_pc30d_pv24h' },
  { name: 'CAST(crt.AverageCartPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_pv24h' },
  { name: 'CAST(sls.OmnichannelSalesAllPc30d AS NUMERIC)', type: 'NUMERIC', alias: 'omni_sales_all_pc30d' },
  { name: 'CAST(sls.OmnichannelSalesAllPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'omni_sales_all_pv24h' },
  { name: 'CAST(sls.OmnichannelSalesPc30d AS NUMERIC)', type: 'NUMERIC', alias: 'omni_sales_pc30d' },
  { name: 'CAST(sls.OmnichannelSalesPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'omni_sales_pv24h' },
  { name: 'CAST(sls.OmnichannelSalesClientAttribution AS NUMERIC)', type: 'NUMERIC', alias: 'omni_sales_client_attribution' },
  { name: 'CAST(sls.SalesAllPc1d AS NUMERIC)', type: 'NUMERIC', alias: 'sales_all_pc1d' },
  { name: 'CAST(sls.SalesAllPc7d AS NUMERIC)', type: 'NUMERIC', alias: 'sales_all_pc7d' },
  { name: 'CAST(sls.SalesAllPc30d AS NUMERIC)', type: 'NUMERIC', alias: 'sales_all_pc30d' },
  { name: 'CAST(sls.SalesAllPc30dPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'sales_all_pc30d_pv24h' },
  { name: 'CAST(sls.SalesAllPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'sales_all_pv24h' },
  { name: 'CAST(sls.SalesClientAttribution AS NUMERIC)', type: 'NUMERIC', alias: 'sales_client_attribution' },
  { name: 'CAST(sls.SalesOfflinePc30d AS NUMERIC)', type: 'NUMERIC', alias: 'sales_offline_pc30d' },
  { name: 'CAST(sls.SalesOfflinePv24h AS NUMERIC)', type: 'NUMERIC', alias: 'sales_offline_pv24h' },
  { name: 'CAST(sls.SalesPc1d AS NUMERIC)', type: 'NUMERIC', alias: 'sales_pc1d' },
  { name: 'CAST(sls.SalesPc7d AS NUMERIC)', type: 'NUMERIC', alias: 'sales_pc7d' },
  { name: 'CAST(sls.SalesPc30d AS NUMERIC)', type: 'NUMERIC', alias: 'sales_pc30d' },
  { name: 'CAST(sls.SalesPc30dPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'sales_pc30d_pv24h' },
  { name: 'CAST(sls.SalesPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'sales_pv24h' },
  { name: 'CAST(rvn.AdvertiserAllValue AS NUMERIC)', type: 'NUMERIC', alias: 'advertiser_all_value' },
  { name: 'CAST(rvn.AdvertiserValue AS NUMERIC)', type: 'NUMERIC', alias: 'advertiser_value' },
  { name: 'CAST(rvn.OmnichannelRevenueAllPc30d AS NUMERIC)', type: 'NUMERIC', alias: 'omni_revenue_all_pc30d' },
  { name: 'CAST(rvn.OmnichannelRevenueAllPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'omni_revenue_all_pc24h' },
  { name: 'CAST(rvn.OmnichannelRevenuePc30d AS NUMERIC)', type: 'NUMERIC', alias: 'omni_revenue_pc30d' },
  { name: 'CAST(rvn.OmnichannelRevenuePv24h AS NUMERIC)', type: 'NUMERIC', alias: 'omni_revenue_pv24h' },
  { name: 'CAST(rvn.RevenueGeneratedAllPc1d AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_all_pc1d' },
  { name: 'CAST(rvn.RevenueGeneratedAllPc7d AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_all_pc7d' },
  { name: 'CAST(rvn.RevenueGeneratedAllPc30d AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_all_pc30d' },
  { name: 'CAST(rvn.RevenueGeneratedAllPc30dPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_all_pc30d_pv24h' },
  { name: 'CAST(rvn.RevenueGeneratedAllPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_all_pv24h' },
  { name: 'CAST(rvn.OmnichannelRevenueClientAttribution AS NUMERIC)', type: 'NUMERIC', alias: 'omni_revenue_client_attribution' },
  { name: 'CAST(rvn.RevenueGeneratedOfflinePc30d AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_offline_pc30d' },
  { name: 'CAST(rvn.RevenueGeneratedOfflinePv24h AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_offline_pc24h' },
  { name: 'CAST(rvn.RevenueGeneratedPc1d AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_pc1d' },
  { name: 'CAST(rvn.RevenueGeneratedPc7d AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_pc7d' },
  { name: 'CAST(rvn.RevenueGeneratedPc30d AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_pc30d' },
  { name: 'CAST(rvn.RevenueGeneratedPc30dPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_pc30d_pv24h' },
  { name: 'CAST(rvn.RevenueGeneratedPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_pv24h' }
])

const uniqueAssertion = getPrimaryKeys(columns);
const nonNullAssertion = getNotNullColumns(columns);


function generateJoinQuery(ctx, columns, sourceSchemaSuffix, tablesToJoin, uniqueAssertion, businessUnit) {
  const baseTable = tablesToJoin.shift(); // Assuming the first table is the base for joining others
  let baseQuery = `SELECT ${generateSelectColumns(ctx, columns)} FROM ${ctx.ref(`${businessUnit.schemaPreffix}_${sourceSchemaSuffix}`, baseTable)} `;
  
  tablesToJoin.forEach((table, index) => {
      const tableAlias = `t${index + 1}`;
      baseQuery += `
        JOIN ${ctx.ref(`${businessUnit.schemaPreffix}_${sourceSchemaSuffix}`, table)} ${tableAlias}
        ON ${joinOn(uniqueAssertion, baseTable, tableAlias)}\n
      `;
  });
  return baseQuery;
}


businessUnits.forEach(businessUnit => {
  publish('stg_stats', {
      type: 'view',
      schema: `${businessUnit.schemaPreffix}_${sourceSchemaSuffix}`,
      assertions: {
          uniqueKey: uniqueAssertion,
          nonNull: nonNullAssertion
      },
      tags: ['staging', 'view', 'dim']
  }).query(ctx => generateJoinQuery(
      ctx, columns, sourceSchemaSuffix,
      ['account_statistics_pre_click', 'account_statistics_app', 'account_statistics_avg_cart', 'account_statistics_sales', 'account_statistics_revenue'],
      uniqueAssertion, businessUnit
  ))
});

module.exports = {
  columns,
  uniqueAssertion,
  nonNullAssertion
}
