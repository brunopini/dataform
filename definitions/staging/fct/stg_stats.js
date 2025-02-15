const {
  sourceSchemaSuffix,
  businessUnits
} = require('config.js');
const {
  generateJoinQueryForAccounts
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
  { name: 'CAST(t0.AdvertiserCost AS NUMERIC)', type: 'NUMERIC', alias: 'advertiser_cost' },
  { name: 'CAST(t0.Clicks AS NUMERIC)', type: 'NUMERIC', alias: 'clicks' },
  { name: 'CAST(t0.Displays AS NUMERIC)', type: 'NUMERIC', alias: 'displays' },
  { name: 'CAST(t0.NonViewableDisplays AS NUMERIC)', type: 'NUMERIC', alias: 'non_viewable_displays' },
  { name: 'CAST(t0.PotentialDisplays AS NUMERIC)', type: 'NUMERIC', alias: 'potential_displays' },
  { name: 'CAST(t0.UntrackableDisplays AS NUMERIC)', type: 'NUMERIC', alias: 'untrackable_displays' },
  { name: 'CAST(t0.ViewableDisplays AS NUMERIC)', type: 'NUMERIC', alias: 'viewable_displays' },
  { name: 'CAST(t1.AppInstalls AS NUMERIC)', type: 'NUMERIC', alias: 'app_installs' },
  { name: 'CAST(t1.PostInstallSales AS NUMERIC)', type: 'NUMERIC', alias: 'post_install_sales' },
  { name: 'CAST(t1.PostInstallOrderValue AS NUMERIC)', type: 'NUMERIC', alias: 'post_install_order_value' },
  { name: 'CAST(t2.AverageCartAllClientAttribution AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_all_client_attribution' },
  { name: 'CAST(t2.AverageCartAllPc1d AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_all_pc1d' },
  { name: 'CAST(t2.AverageCartAllPc7d AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_all_pc7d' },
  { name: 'CAST(t2.AverageCartAllPc30d AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_all_pc30d' },
  { name: 'CAST(t2.AverageCartAllPc30dPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_all_pc30d_pv24h' },
  { name: 'CAST(t2.AverageCartAllPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_all_pv24h' },
  { name: 'CAST(t2.AverageCartClientAttribution AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_client_attribution' },
  { name: 'CAST(t2.AverageCartPc1d AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_pc1d' },
  { name: 'CAST(t2.AverageCartPc7d AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_pc7d' },
  { name: 'CAST(t2.AverageCartPc30d AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_pc30d' },
  { name: 'CAST(t2.AverageCartPc30dPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_pc30d_pv24h' },
  { name: 'CAST(t2.AverageCartPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'avg_cart_pv24h' },
  { name: 'CAST(t3.OmnichannelSalesAllPc30d AS NUMERIC)', type: 'NUMERIC', alias: 'omni_sales_all_pc30d' },
  { name: 'CAST(t3.OmnichannelSalesAllPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'omni_sales_all_pv24h' },
  { name: 'CAST(t3.OmnichannelSalesPc30d AS NUMERIC)', type: 'NUMERIC', alias: 'omni_sales_pc30d' },
  { name: 'CAST(t3.OmnichannelSalesPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'omni_sales_pv24h' },
  { name: 'CAST(t3.OmnichannelSalesClientAttribution AS NUMERIC)', type: 'NUMERIC', alias: 'omni_sales_client_attribution' },
  { name: 'CAST(t3.SalesAllPc1d AS NUMERIC)', type: 'NUMERIC', alias: 'sales_all_pc1d' },
  { name: 'CAST(t3.SalesAllPc7d AS NUMERIC)', type: 'NUMERIC', alias: 'sales_all_pc7d' },
  { name: 'CAST(t3.SalesAllPc30d AS NUMERIC)', type: 'NUMERIC', alias: 'sales_all_pc30d' },
  { name: 'CAST(t3.SalesAllPc30dPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'sales_all_pc30d_pv24h' },
  { name: 'CAST(t3.SalesAllPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'sales_all_pv24h' },
  { name: 'CAST(t3.SalesClientAttribution AS NUMERIC)', type: 'NUMERIC', alias: 'sales_client_attribution' },
  { name: 'CAST(t3.SalesOfflinePc30d AS NUMERIC)', type: 'NUMERIC', alias: 'sales_offline_pc30d' },
  { name: 'CAST(t3.SalesOfflinePv24h AS NUMERIC)', type: 'NUMERIC', alias: 'sales_offline_pv24h' },
  { name: 'CAST(t3.SalesPc1d AS NUMERIC)', type: 'NUMERIC', alias: 'sales_pc1d' },
  { name: 'CAST(t3.SalesPc7d AS NUMERIC)', type: 'NUMERIC', alias: 'sales_pc7d' },
  { name: 'CAST(t3.SalesPc30d AS NUMERIC)', type: 'NUMERIC', alias: 'sales_pc30d' },
  { name: 'CAST(t3.SalesPc30dPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'sales_pc30d_pv24h' },
  { name: 'CAST(t3.SalesPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'sales_pv24h' },
  { name: 'CAST(t4.AdvertiserAllValue AS NUMERIC)', type: 'NUMERIC', alias: 'advertiser_all_value' },
  { name: 'CAST(t4.AdvertiserValue AS NUMERIC)', type: 'NUMERIC', alias: 'advertiser_value' },
  { name: 'CAST(t4.OmnichannelRevenueAllPc30d AS NUMERIC)', type: 'NUMERIC', alias: 'omni_revenue_all_pc30d' },
  { name: 'CAST(t4.OmnichannelRevenueAllPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'omni_revenue_all_pc24h' },
  { name: 'CAST(t4.OmnichannelRevenuePc30d AS NUMERIC)', type: 'NUMERIC', alias: 'omni_revenue_pc30d' },
  { name: 'CAST(t4.OmnichannelRevenuePv24h AS NUMERIC)', type: 'NUMERIC', alias: 'omni_revenue_pv24h' },
  { name: 'CAST(t4.RevenueGeneratedAllPc1d AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_all_pc1d' },
  { name: 'CAST(t4.RevenueGeneratedAllPc7d AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_all_pc7d' },
  { name: 'CAST(t4.RevenueGeneratedAllPc30d AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_all_pc30d' },
  { name: 'CAST(t4.RevenueGeneratedAllPc30dPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_all_pc30d_pv24h' },
  { name: 'CAST(t4.RevenueGeneratedAllPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_all_pv24h' },
  { name: 'CAST(t4.OmnichannelRevenueClientAttribution AS NUMERIC)', type: 'NUMERIC', alias: 'omni_revenue_client_attribution' },
  { name: 'CAST(t4.RevenueGeneratedOfflinePc30d AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_offline_pc30d' },
  { name: 'CAST(t4.RevenueGeneratedOfflinePv24h AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_offline_pc24h' },
  { name: 'CAST(t4.RevenueGeneratedPc1d AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_pc1d' },
  { name: 'CAST(t4.RevenueGeneratedPc7d AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_pc7d' },
  { name: 'CAST(t4.RevenueGeneratedPc30d AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_pc30d' },
  { name: 'CAST(t4.RevenueGeneratedPc30dPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_pc30d_pv24h' },
  { name: 'CAST(t4.RevenueGeneratedPv24h AS NUMERIC)', type: 'NUMERIC', alias: 'revenue_generated_pv24h' }
])

const uniqueAssertion = getPrimaryKeys(columns);
const nonNullAssertion = getNotNullColumns(columns);

const baseTables = [
  'statistics_pre_click', 'statistics_app', 'statistics_avg_cart',
  'statistics_sales', 'statistics_revenue'
];


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
    }).query(ctx => {
        let unionQueries = [];
        
        businessUnit.accountsTablePrefixes.forEach(accountPrefix => {
            // Generate JOIN queries for each account prefix.
            let joinQuery = generateJoinQueryForAccounts(
                ctx, generateSelectColumns(ctx, columns),
                sourceSchemaSuffix, accountPrefix, baseTables,
                getPrimaryKeys(dimColumns(ctx), false), 't0',
                businessUnit
            );
            unionQueries.push(`(${joinQuery})`);
        });

        // Combine all JOIN queries using UNION ALL.
        return unionQueries.join(' UNION ALL ');
    });
});

module.exports = {
  columns,
  uniqueAssertion,
  nonNullAssertion
}
