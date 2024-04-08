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


function publishSilverTableFromStagingViews(tableConfig, tableNature, isIncremental = false, additionalTags = []) {
    const tableSuffix = tableConfig.suffix;
    const definitionsPath = `definitions/staging/${tableNature}/stg_${tableSuffix}.js`;
    let {
        columns, // This might be either an array or a function
        uniqueAssertion,
        nonNullAssertion
    } = require(definitionsPath);

    if (
        typeof tableNature === 'string' && tableNature === 'ngg' && typeof columns === 'function'
    ) {
        const originalColumns = columns; // Save the original columns function
        columns = (ctx) => originalColumns(ctx, tableConfig.suffix.split('_')[0], tableConfig.partitionBy);
    }

    const clusterBy = tableConfig.clusterBy
    const partitionBy = tableConfig.partitionBy; // Will be undefined for dimTables not designed for incrementality
  
    // Combine base tags with additionalTags
    let tags = ['silver', 'table', tableNature, ...additionalTags];
  
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
        publishConfig.uniqueKey = uniqueAssertion
        publishConfig.bigquery.partitionBy = partitionBy;
        publishConfig.bigquery.updatePartitionFilter = `${partitionBy} >= ${lookBackDate('CURRENT_TIMESTAMP()')}`;
        tags.push('incremental');
    }
  
    publish(`${tableNature}_${tableSuffix}`, publishConfig)
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
