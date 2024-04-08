const {
    sourceSchemaSuffix,
    businessUnits
} = require('config.js');
const {
    createOrReplaceTableInplace,
    generateSchemaDefinition
} = require('includes/schema.js');
const {
    generateUnionAllQuery,
    lookBackDate
} = require('includes/utils.js');


function publishSilverTableFromStagingViews(tableConfig, tableType, isIncremental = false, additionalTags = []) {
    const tableSuffix = tableConfig.suffix;
    const definitionsPath = `definitions/staging/${tableType}/stg_${tableSuffix}.js`;
    const {
        columns,
        uniqueAssertion,
        nonNullAssertion
    } = require(definitionsPath);
  
    const clusterBy = tableConfig.clusterBy;
    const partitionBy = tableConfig.partitionBy; // Will be undefined for dimTables not designed for incrementality
  
    // Combine base tags with additionalTags
    let tags = ['silver', 'table', tableType, ...additionalTags];
  
    let publishConfig = {
        type: isIncremental ? 'incremental' : 'table',
        assertions: {
            uniqueKey: uniqueAssertion,
            nonNull: nonNullAssertion
        },
        bigquery: {
            clusterBy: clusterBy
        },
        tags: tags
    };
  
    // Adjust the publish configuration for incremental tables
    if (isIncremental) {
        publishConfig.bigquery.partitionBy = partitionBy;
        publishConfig.bigquery.updatePartitionFilter = `${partitionBy} >= ${lookBackDate('CURRENT_TIMESTAMP()')}`;
    }
  
    publish(`${tableType}_${tableSuffix}`, publishConfig)
    .query(ctx => {
        let unionParts = [];
  
        businessUnits.forEach(businessUnit => {
            const part = generateUnionAllQuery(ctx, '*', sourceSchemaSuffix, `stg_${tableSuffix}`, businessUnit, false);
            unionParts.push(part);
        });
  
        return unionParts.join(' UNION ALL ');
    })
    .preOps(ctx => `
        DECLARE schema_is_set BOOL DEFAULT FALSE;
        ${isIncremental ? `
        DECLARE insert_date_checkpoint DEFAULT (
            ${
                ctx.when(ctx.incremental(),
                    `SELECT ${lookBackDate(`MAX(${partitionBy})`)} FROM ${ctx.self()}`,
                    `SELECT DATE('2000-01-01')`)
            }
        );` : ''}
    `)
    .postOps(ctx => `
        ${createOrReplaceTableInplace(ctx, generateSchemaDefinition(ctx, columns), clusterBy, partitionBy)}
    `);
}

module.exports = {
    publishSilverTableFromStagingViews
}
