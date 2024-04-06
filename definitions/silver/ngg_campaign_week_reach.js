const {
    lookBackDate,
    clusterBy
} = require("includes/utils.js");
const {
    nggReachSchema,
    nggReachSelect
} = require("includes/reach.js");
const {
    createOrReplaceTable,
} = require("includes/schema.js");

// Config
// Table names
const targetTable = "ngg_campaign_week_reach";
const sourceTable = "user_agg_campaign_week"
// Column mappings
const sourceEntity = "CampaignId";
const targetTimeframe = "week";
const sourceTimeframe = "Week";
// Referenced dim table
const dimEntity = "campaign";

// Static
// Primary keys
const primaryKey = [targetTimeframe, "id", "advertiser_id"];

publish(targetTable, {
    type: "incremental",
    uniqueKey: primaryKey,
    assertions: {
        uniqueKey: primaryKey,
        nonNull: primaryKey
    },
    bigquery: {
        clusterBy: [clusterBy],
        partitionBy: targetTimeframe,
        updatePartitionFilter: `${targetTimeframe} >= ${lookBackDate('DATE(CURRENT_TIMESTAMP())')}`
    }
}).query(ctx => `
    SELECT ${nggReachSelect(sourceEntity, sourceTimeframe, targetTimeframe)}
    FROM ${ctx.ref(sourceTable)}
    ${ctx.when(ctx.incremental(), `WHERE DATE(${sourceTimeframe}) > insert_date_checkpoint`)}
`).preOps(ctx => `
    DECLARE
    insert_date_checkpoint DEFAULT (
        ${
            ctx.when(ctx.incremental(),
                `SELECT ${lookBackDate(`MAX(${targetTimeframe})`)} FROM ${ctx.self()}`,
                `SELECT DATE("2000-01-01")`)
        }
    );
    DECLARE schema_is_set BOOL DEFAULT FALSE;
`).postOps(ctx => `${createOrReplaceTable(
    ctx.self(),
    `${nggReachSchema(targetTimeframe, primaryKey, ctx, dimEntity)}`,
    targetTimeframe,
    clusterBy)}`
);
