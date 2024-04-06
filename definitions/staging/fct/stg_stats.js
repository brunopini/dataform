const {
    joinOn,
} = require("includes/utils.js");
const {
    primaryKeyRaw,
    statsSelectDimensions,
    viewConfig,
} = require("includes/stats.js");


publish('stg_stats', viewConfig).query(ctx => `
  SELECT
    -- Ommit comma ,
    ${statsSelectDimensions('dlv')}
    -- dlvMetricsSelect
    CAST(dlv.AdvertiserCost AS NUMERIC) AS advertiser_cost,
    CAST(dlv.Clicks AS NUMERIC) AS clicks,
    CAST(dlv.Displays AS NUMERIC) AS displays,
    CAST(dlv.NonViewableDisplays AS NUMERIC) AS non_viewable_displays,
    CAST(dlv.PotentialDisplays AS NUMERIC) AS potential_displays,
    CAST(dlv.UntrackableDisplays AS NUMERIC) AS untrackable_displays,
    CAST(dlv.ViewableDisplays AS NUMERIC) AS viewable_displays,
    -- appMetricsSelect
    CAST(app.AppInstalls AS NUMERIC) AS app_installs,
    CAST(app.PostInstallSales AS NUMERIC) AS post_install_sales,
    CAST(app.PostInstallOrderValue AS NUMERIC) AS post_install_order_value,
    -- crtMetricsSelect
    CAST(crt.AverageCartAllClientAttribution AS NUMERIC) AS avg_cart_all_client_attribution,
    CAST(crt.AverageCartAllPc1d AS NUMERIC) AS avg_cart_all_pc1d,
    CAST(crt.AverageCartAllPc7d AS NUMERIC) AS avg_cart_all_pc7d,
    CAST(crt.AverageCartAllPc30d AS NUMERIC) AS avg_cart_all_pc30d,
    CAST(crt.AverageCartAllPc30dPv24h AS NUMERIC) AS avg_cart_all_pc30d_pv24h,
    CAST(crt.AverageCartAllPv24h AS NUMERIC) AS avg_cart_all_pv24h,
    CAST(crt.AverageCartClientAttribution AS NUMERIC) AS avg_cart_client_attribution,
    CAST(crt.AverageCartPc1d AS NUMERIC) AS avg_cart_pc1d,
    CAST(crt.AverageCartPc7d AS NUMERIC) AS avg_cart_pc7d,
    CAST(crt.AverageCartPc30d AS NUMERIC) AS avg_cart_pc30d,
    CAST(crt.AverageCartPc30dPv24h AS NUMERIC) AS avg_cart_pc30d_pv24h,
    CAST(crt.AverageCartPv24h AS NUMERIC) AS avg_cart_pv24h,
    -- slsMetricsSelect
    CAST(sls.OmnichannelSalesAllPc30d AS NUMERIC) AS omni_sales_all_pc30d,
    CAST(sls.OmnichannelSalesAllPv24h AS NUMERIC) AS omni_sales_all_pv24h,
    CAST(sls.OmnichannelSalesPc30d AS NUMERIC) AS omni_sales_pc30d,
    CAST(sls.OmnichannelSalesPv24h AS NUMERIC) AS omni_sales_pv24h,
    CAST(sls.OmnichannelSalesClientAttribution AS NUMERIC) AS omni_sales_client_attribution,
    CAST(sls.SalesAllPc1d AS NUMERIC) AS sales_all_pc1d,
    CAST(sls.SalesAllPc7d AS NUMERIC) AS sales_all_pc7d,
    CAST(sls.SalesAllPc30d AS NUMERIC) AS sales_all_pc30d,
    CAST(sls.SalesAllPc30dPv24h AS NUMERIC) AS sales_all_pc30d_pv24h,
    CAST(sls.SalesAllPv24h AS NUMERIC) AS sales_all_pv24h,
    CAST(sls.SalesClientAttribution AS NUMERIC) AS sales_client_attribution,
    CAST(sls.SalesOfflinePc30d AS NUMERIC) AS sales_offline_pc30d,
    CAST(sls.SalesOfflinePv24h AS NUMERIC) AS sales_offline_pv24h,
    CAST(sls.SalesPc1d AS NUMERIC) AS sales_pc1d,
    CAST(sls.SalesPc7d AS NUMERIC) AS sales_pc7d,
    CAST(sls.SalesPc30d AS NUMERIC) AS sales_pc30d,
    CAST(sls.SalesPc30dPv24h AS NUMERIC) AS sales_pc30d_pv24h,
    CAST(sls.SalesPv24h AS NUMERIC) AS sales_pv24h,
    -- rvnMetricsSelect
    CAST(rvn.AdvertiserAllValue AS NUMERIC) AS advertiser_all_value,
    CAST(rvn.AdvertiserValue AS NUMERIC) AS advertiser_value,
    CAST(rvn.OmnichannelRevenueAllPc30d AS NUMERIC) AS omni_revenue_all_pc30d,
    CAST(rvn.OmnichannelRevenueAllPv24h AS NUMERIC) AS omni_revenue_all_pc24h,
    CAST(rvn.OmnichannelRevenuePc30d AS NUMERIC) AS omni_revenue_pc30d,
    CAST(rvn.OmnichannelRevenuePv24h AS NUMERIC) AS omni_revenue_pv24h,
    CAST(rvn.RevenueGeneratedAllPc1d AS NUMERIC) AS revenue_generated_all_pc1d,
    CAST(rvn.RevenueGeneratedAllPc7d AS NUMERIC) AS revenue_generated_all_pc7d,
    CAST(rvn.RevenueGeneratedAllPc30d AS NUMERIC) AS revenue_generated_all_pc30d,
    CAST(rvn.RevenueGeneratedAllPc30dPv24h AS NUMERIC) AS revenue_generated_all_pc30d_pv24h,
    CAST(rvn.RevenueGeneratedAllPv24h AS NUMERIC) AS revenue_generated_all_pv24h,
    CAST(rvn.OmnichannelRevenueClientAttribution AS NUMERIC) AS omni_revenue_client_attribution,
    CAST(rvn.RevenueGeneratedOfflinePc30d AS NUMERIC) AS revenue_generated_offline_pc30d,
    CAST(rvn.RevenueGeneratedOfflinePv24h AS NUMERIC) AS revenue_generated_offline_pc24h,
    CAST(rvn.RevenueGeneratedPc1d AS NUMERIC) AS revenue_generated_pc1d,
    CAST(rvn.RevenueGeneratedPc7d AS NUMERIC) AS revenue_generated_pc7d,
    CAST(rvn.RevenueGeneratedPc30d AS NUMERIC) AS revenue_generated_pc30d,
    CAST(rvn.RevenueGeneratedPc30dPv24h AS NUMERIC) AS revenue_generated_pc1d_pv24h,
    CAST(rvn.RevenueGeneratedPv24h AS NUMERIC) AS revenue_generated_pv24h,
  FROM
    ${ctx.ref('statistics_pre_click')} dlv
  JOIN
    ${ctx.ref('statistics_app')} app
    ON ${joinOn(primaryKeyRaw, 'dlv', 'app')}
  JOIN
    ${ctx.ref('statistics_avg_cart')} crt
    ON ${joinOn(primaryKeyRaw, 'dlv', 'crt')}
  JOIN
    ${ctx.ref('statistics_sales')} sls
    ON ${joinOn(primaryKeyRaw, 'dlv', 'sls')}
  JOIN
    ${ctx.ref('statistics_revenue')} rvn
    ON ${joinOn(primaryKeyRaw, 'dlv', 'rvn')}
`)
