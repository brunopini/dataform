const {
    lookBackDate,
    metricsTypeDeclarations,
    removeTrailingComma,
    clusterBy,
} = require("includes/utils.js");
const {
    tableConfig,
    statsSelectDimensions,
    statsSchemaDimensions,
} = require("includes/stats.js");
const {
    createOrReplaceTable,
} = require("includes/schema.js");

// Config
// Table names
const targetTable = "ngg_stats_day";
const sourceTable = "statistics_user_agg";
// Metric columns SELECT
const metricsSelect = `
  CAST(Audience AS NUMERIC) AS audience_size,
  CAST(ExposedUsers AS NUMERIC) AS exposed_users,
  CAST(Visits AS NUMERIC) AS visits,
  CAST(QualifiedVisits AS NUMERIC) AS qualified_visits,
`;
// Metric columns types, omit last comma ,
const metricsSchema = removeTrailingComma(metricsTypeDeclarations(metricsSelect));

publish(targetTable, tableConfig).query(ctx => `
  SELECT
    ${statsSelectDimensions()}
    -- Ommit comma ,
    ${metricsSelect}
  FROM ${ctx.ref(sourceTable)}
  ${ctx.when(ctx.incremental(), `WHERE DATE(Day) > insert_date_checkpoint`)}
`).preOps(ctx => `
  DECLARE
    insert_date_checkpoint DEFAULT (
    ${
        ctx.when(ctx.incremental(),
            `SELECT ${lookBackDate('MAX(date)')} FROM ${ctx.self()}`,
            `SELECT DATE("2000-01-01")`)
    }
    );
    DECLARE schema_is_set BOOL DEFAULT FALSE;
`).postOps(ctx => `${createOrReplaceTable(
  ctx.self(),
  `${statsSchemaDimensions(metricsSchema, ctx)}`,
  'date',
  clusterBy)}`);
