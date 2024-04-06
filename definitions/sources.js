const sourceStreams = [
    'ads',
    'adsets',
    'campaigns',
    'coupons',
    'creatives',
    'statistics_app',
    'statistics_avg_cart',
    'statistics_pre_click',
    'statistics_revenue',
    'statistics_sales',
    'statistics_user_agg',
    'user_agg_adset_month',
    'user_agg_adset_week',
    'user_agg_adset_year',
    'user_agg_campaign_month',
    'user_agg_campaign_week',
    'user_agg_campaign_year',
];

const businessUnits = dataform.projectConfig.vars.products;
const sourceSchemaSuffix = dataform.projectConfig.vars.sourceSchemaSuffix;

businessUnits.forEach(businessUnit => {
    const schemaName = `${businessUnit.schemaPreffix}_${sourceSchemaSuffix}`;
  
    businessUnit.accountsTablePrefixes.forEach(account => {
      sourceStreams.forEach(table => {
        const tableName = `${account}_${table}`;
  
        declare({
          schema: schemaName,
          name: tableName
        });
      });
    });
  });
