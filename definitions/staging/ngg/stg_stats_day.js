const {
    viewConfig,
    statsSelectDimensions,
} = require("includes/stats.js");


publish('stg_stats_day', viewConfig).query(ctx => `
  SELECT
    ${statsSelectDimensions()}
    CAST(Audience AS NUMERIC) AS audience_size,
    CAST(ExposedUsers AS NUMERIC) AS exposed_users,
    CAST(Visits AS NUMERIC) AS visits,
    CAST(QualifiedVisits AS NUMERIC) AS qualified_visits,
  FROM ${ctx.ref('statistics_user_agg')}
`)
