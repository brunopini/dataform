const {
    sourceSchemaSuffix,
    businessUnits
} = require('config.js');
const {
    declareSchemaIsSet,
    createOrReplaceTableInplace,
    generateSchemaDefinition
} = require('includes/schema.js');
const {
    generateUnionAllQuery,
} = require('includes/utils.js');
const {
    lookBackDate,
    declareInsertDateCheckpoint
} = require('includes/incremental.js');


function publishSilverTableFromStagingViews(tableConfig, tableNature, isIncremental = false, whereConditions = [], additionalTags = []) {
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
    // let whereConditions = [];
    if (isIncremental) {
        publishConfig.uniqueKey = uniqueAssertion
        if(partitionBy) {
            publishConfig.bigquery.partitionBy = partitionBy;
            publishConfig.bigquery.updatePartitionFilter = `${partitionBy} >= ${lookBackDate(partitionBy, true)}`;
            whereConditions = whereConditions.concat([`${publishConfig.bigquery.partitionBy} >= insert_date_checkpoint`]);
        }
        tags.push('incremental');
    }
  
    publish(`${tableNature}_${tableSuffix}`, publishConfig)
    .query(ctx => {
        let unionParts = [];
  
        businessUnits.forEach(businessUnit => {
            const part = generateUnionAllQuery(ctx, '*', sourceSchemaSuffix, `stg_${tableSuffix}`, businessUnit, false, false, whereConditions);
            unionParts.push(part);
        });
  
        return unionParts.join(' UNION ALL ');
    }) // TODO Prep for incremental non temporal
    .preOps(ctx => `
        ${declareSchemaIsSet}
        ${(isIncremental) ? declareInsertDateCheckpoint(ctx, partitionBy, (false ? partitionBy : true)) : ''}
    `)
    .postOps(ctx => createOrReplaceTableInplace(ctx, generateSchemaDefinition(ctx, columns), clusterBy, partitionBy));
}

module.exports = {
    publishSilverTableFromStagingViews
}
