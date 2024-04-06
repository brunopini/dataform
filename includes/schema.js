function createOrReplaceTable(datasetTable, schema, partitionBy = '', clusterBy = '') {
    const tableDeconstruct = datasetTable.replace(/`/g, '').split('.');
    const [_, dataset, table] = tableDeconstruct;

    const partitionStatement = partitionBy !== '' ? `PARTITION BY ${partitionBy}` : '';
    const clusterStatement = clusterBy !== '' ? `CLUSTER BY ${clusterBy}` : '';

    return `
        SET schema_is_set = (
            SELECT COUNT(*) > 0
            FROM ${dataset}.INFORMATION_SCHEMA.COLUMNS
            WHERE table_name = '${table}' AND is_nullable = 'NO' AND data_type = 'STRING'
        );
        IF NOT schema_is_set THEN
            CREATE OR REPLACE TABLE ${datasetTable}
            (
            ${schema}
            )
            ${partitionStatement}
            ${clusterStatement}
            AS
            SELECT * FROM ${datasetTable};
        END IF;
`};

function simpleDimSchema(primaryKey) {
    return `
        id STRING NOT NULL,
        name STRING NOT NULL,
        PRIMARY KEY (${primaryKey}) NOT ENFORCED
`};

module.exports = {
    createOrReplaceTable,
    simpleDimSchema
}
