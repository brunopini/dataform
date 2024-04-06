/**
 * Generates a SQL SELECT statement from a given columns configuration.
 * This function constructs a SELECT statement that includes all columns specified in the columns definition,
 * using their 'name' as the column identifier and their 'alias' as the alias in the SQL statement. 
 * If an alias is provided, it will be used in the SELECT statement; otherwise, the column's name will be used directly.
 * 
 * This function can accept the columns configuration either as a function that returns an array of column definitions
 * or directly as an array of column definitions. If a function is provided, it will be invoked with the provided ctx object.
 * 
 * @param {Object} ctx A context object that provides additional information and functionalities needed by the columnsDefinition function.
 * The context object includes a `ref` method, which might be used by `columnsDefinition` to reference other tables or perform other context-specific actions.
 * @param {Function|Array<Object>} columnsDefinition A function that accepts a context object as an argument and returns an array of column definitions,
 * or an array of column definitions directly. Each element in the array is an object representing a column in the database.
 * This object may contain properties such as 'name', 'type', 'alias', and 'constraints', which define the column's characteristics
 * and how it should be represented in the SQL SELECT statement.
 * 
 * @returns {string} The SQL SELECT statement as a string. The statement includes all columns specified in the columns definition,
 * formatted with their aliases (if provided) and separated by commas. This string is ready to be used in SQL queries to select data from a table.
 */
function generateSelectStatement(ctx, columnsDefinition) {
    // Determine if columnsDefinition is a function and call it with ctx, else use it directly
    const columns = typeof columnsDefinition === 'function' ? columnsDefinition(ctx) : columnsDefinition;

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
 * Generates a SQL schema definition from a given columns configuration, supporting columns with multiple constraints,
 * including the ability for a column to be both a primary key and have foreign key constraints.
 * 
 * This function is designed to accept the columns configuration either as a function that returns an array of column definitions
 * or directly as an array of column definitions. If a function is provided, it will be invoked with the provided ctx object.
 * 
 * @param {Object} ctx A context object that provides additional information and functionalities needed by the columnsDefinition function.
 * The context object includes a `ref` method, which might be used by `columnsDefinition` to reference other tables or perform other context-specific actions.
 * @param {Function|Array<Object>} columnsDefinition A function that accepts a context object as an argument and returns an array of column definitions,
 * or an array of column definitions directly. Each element in the array is an object representing a column in the database.
 * This object may contain properties such as 'name', 'type', 'alias', and 'constraints', which define the column's characteristics
 * and how it should be represented in the SQL CREATE TABLE statement.
 * 
 * @returns {string} A string representing the SQL schema definition, including all column definitions and constraints.
 */
function generateSchemaDefinition(ctx, columnsDefinition) {
    // Determine if columnsDefinition is a function and call it with ctx, else use it directly
    const columns = typeof columnsDefinition === 'function' ? columnsDefinition(ctx) : columnsDefinition;

  
    let schemaParts = columns.map(col => {
      return col.alias ? `${col.alias} ${col.type}` : `${col.name} ${col.type}`;
    });
  
    // Separate handling for primary and foreign keys
    let primaryKeys = [];
    let foreignKeys = [];
  
    columns.forEach(col => {
      (col.constraints || []).forEach(constraint => {
        if (constraint.includes('PRIMARY KEY')) {
          primaryKeys.push(col.alias || col.name);
        } else if (constraint.includes('FOREIGN KEY')) {
          foreignKeys.push(constraint);
        }
      });
    });
  
    if (primaryKeys.length > 0) {
      schemaParts.push(`PRIMARY KEY (${primaryKeys.join(', ')}) NOT ENFORCED`);
    }
  
    schemaParts = schemaParts.concat(foreignKeys);
  
    return `(\n${schemaParts.join(',\n  ')}\n)`;
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
`}

/**
 * Extracts a list of column aliases (or names if alias is not present) marked as not null from the given columns definition.
 * 
 * @param {Function|Array<Object>} columnsDefinition A function that accepts a context object as an argument and returns an array of column definitions,
 * or an array of column definitions directly. Each element in the array is an object representing a column in the database.
 * This object may contain properties such as 'name', 'type', 'alias', and 'constraints', which define the column's characteristics
 * and which columns are defined as NOT NULL.
 * @returns {Array<string>} A list of column aliases or names that are marked as not null.
 */
function getNotNullColumns(columnsDefinition) {
    const ctx = { ref: (tableName) => tableName }; // Mocked ctx
    const columns = typeof columnsDefinition === 'function' ? columnsDefinition(ctx) : columnsDefinition;
    return columns
        .filter(col => col.type && col.type.includes('NOT NULL'))
        .map(col => col.alias || col.name);
}

/**
 * Extracts a list of column aliases (or names if alias is not present) marked as primary keys from the given columns definition.
 * 
 * @param {Function|Array<Object>} columnsDefinition A function that accepts a context object as an argument and returns an array of column definitions,
 * or an array of column definitions directly. Each element in the array is an object representing a column in the database.
 * This object may contain properties such as 'name', 'type', 'alias', and 'constraints', which define the column's characteristics
 * and which columns are defined as PRIMARY KEYS.
 * @returns {Array<string>} A list of column aliases or names that are marked as primary keys.
 */
function getPrimaryKeys(columnsDefinition) {
    const ctx = { ref: (tableName) => tableName }; // Mocked ctx
    const columns = typeof columnsDefinition === 'function' ? columnsDefinition(ctx) : columnsDefinition;
    return columns
        .filter(col => col.constraints && col.constraints.some(constraint => constraint.includes('PRIMARY KEY')))
        .map(col => col.alias || col.name);
}

const simpleDimColumns = (dimEntitySource) => [
    { name: `${dimEntitySource}Id`, type: 'STRING NOT NULL', alias: 'id', constraints: [
        'PRIMARY KEY'] },
    { name: `${dimEntitySource}Name`, type: 'STRING NOT NULL', alias: 'name' }
];

function simpleDimSchema(primaryKey) {
    return `
        id STRING NOT NULL,
        name STRING NOT NULL,
        PRIMARY KEY (${primaryKey}) NOT ENFORCED
`}

module.exports = {
    generateSelectStatement,
    generateSchemaDefinition,
    getPrimaryKeys,
    getNotNullColumns,
    createOrReplaceTable,
    simpleDimSchema,
    simpleDimColumns
}
