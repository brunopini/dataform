/**
 * Generates a SQL SELECT statement from a given columns configuration.
 * This function constructs a SELECT statement that includes all columns specified in the columns definition,
 * using their 'name' as the column identifier and their 'alias' as the alias in the SQL statement. 
 * If an alias is provided, it will be used in the SELECT statement; otherwise, the column's name will be used directly.
 * 
 * @param {Object} ctx A context object that provides additional information and functionalities needed by the columnsDefinition function.
 * The context object includes a `ref` method, which might be used by `columnsDefinition` to reference other tables or perform other context-specific actions.
 * @param {Function} columnsDefinition A function that accepts a context object as an argument and returns an array of column definitions.
 * Each element in the array is an object representing a column in the database. This object may contain properties such as 'name', 'type', 'alias', and 'constraints',
 * which define the column's characteristics and how it should be represented in the SQL SELECT statement.
 * 
 * @returns {string} The SQL SELECT statement as a string. The statement includes all columns specified in the columns definition,
 * formatted with their aliases (if provided) and separated by commas. This string is ready to be used in SQL queries to select data from a table.
 */
function generateSelectStatement(ctx, columnsDefinition) {
    const columns = columnsDefinition(ctx);

    // Generate the SELECT part of the SQL statement
    const selectClause = columns.map(col => {
        // Use the alias if available, otherwise use the name directly
        if (col.alias) {
        return `${col.name} AS ${col.alias}`;
        }
        return col.name;
    }).join(',\n');

    return selectClause;
}

/**
 * Generates a SQL schema definition from a given columns configuration.
 * 
 * @param {Object} ctx A context object that provides additional information and functionalities needed by the columnsDefinition function.
 * The context object includes a `ref` method used to reference other tables in foreign key constraints.
 * @param {Function} columnsDefinition A function that takes the context object as an argument and returns an array of column definitions.
 * Each column definition is an object that may contain properties such as name, type, alias, and constraints, defining each column's characteristics.
 * 
 * @returns {string} The SQL schema definition as a string. This includes column definitions and constraints, such as primary keys and foreign keys,
 * formatted according to SQL syntax. The schema is wrapped in an "AS (...)" clause, suitable for use in creating views or table schemas.
 */
function generateSchemaDefinition(ctx, columnsDefinition) {
    const columns = columnsDefinition(ctx);
  
    let schemaParts = columns.map(col => {
      // Format each column definition
      let columnDef = col.alias ? `${col.alias} ${col.type}` : `${col.name} ${col.type}`
      return columnDef;
    });
  
    // Handle primary key separately since it's not part of the individual column definition
    const primaryKey = columns.filter(col => col.constraints && col.constraints.includes('PRIMARY KEY'))
                            .map(col => col.alias || col.name);
    if (primaryKey.length > 0) {
        schemaParts.push(`PRIMARY KEY (${primaryKey.join(', ')}) NOT ENFORCED`);
    }
  
    // Adjust handling for foreign keys based on the new requirements
    const foreignKeys = columns.filter(col => col.constraints && col.constraints.includes('FOREIGN KEY'))
                                .map(col => {
                                    const fkDetails = col.constraints.match(/FOREIGN KEY(?: \((.*?)\))? (.*)\((.*)\)/);
                                    const columnName = fkDetails[1] ? `${col.alias || col.name}, ${fkDetails[1]}` : (col.alias || col.name);
                                    const referenceTable = fkDetails[2];
                                    const referenceColumns = fkDetails[3];
                                    return `FOREIGN KEY (${columnName}) REFERENCES ${referenceTable}(${referenceColumns}) NOT ENFORCED`;
                                });
  
    schemaParts = [...schemaParts, ...foreignKeys];
  
    return `${schemaParts.join(',\n  ')}`;
}

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
    generateSelectStatement,
    generateSchemaDefinition,
    createOrReplaceTable,
    simpleDimSchema
}
