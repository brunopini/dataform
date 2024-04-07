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
function generateSelectColumns(ctx, columnsDefinition) {
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
          } else if (constraint.startsWith('FOREIGN KEY')) {
              // Extract the FK details, including any local columns specified and the reference part
              const fkPattern = /^FOREIGN KEY(?: \((.*?)\))? (.*)\((.*)\)$/;
              const matches = fkPattern.exec(constraint);
              if (matches) {
                  const localColumnsSpecified = matches[1];
                  const referencePart = matches[2];
                  const referenceColumns = matches[3];
                  // Construct the local part of the FK definition
                  const localPart = localColumnsSpecified ? `${col.alias || col.name}, ${localColumnsSpecified}` : col.alias || col.name;
                  foreignKeys.push(`FOREIGN KEY (${localPart}) REFERENCES ${referencePart}(${referenceColumns}) NOT ENFORCED`);
              }
          }
      });
  });
  
    if (primaryKeys.length > 0) {
      schemaParts.push(`PRIMARY KEY (${primaryKeys.join(', ')}) NOT ENFORCED`);
    }
  
    schemaParts = schemaParts.concat(foreignKeys);
  
    return `(\n${schemaParts.join(',\n  ')}\n)`;
}

/**
 * Creates or replaces a BigQuery table based on the provided columns definition, with optional partitioning and clustering.
 * This function constructs a BigQuery SQL script that checks if a table already exists with specific characteristics (e.g., non-nullable STRING columns).
 * If the table does not exist or needs to be replaced, it creates or replaces the table using the provided columns definition,
 * applying partitioning and clustering configurations if specified.
 * 
 * The function dynamically determines the dataset and table name based on the `ctx.self()` reference, which should return the full table path in BigQuery.
 * 
 * @param {Object} ctx A context object containing the `self` method, which returns the full path to the BigQuery table in the format `project.dataset.table`.
 * The context object may also be used within the columnsDefinition function to reference other tables or perform context-specific actions.
 * @param {Function|Array<Object>} columnsDefinition A function that accepts a context object as an argument and returns an array of column definitions,
 * or an array of column definitions directly. The column definitions should include details like name, type, alias, and constraints.
 * @param {string} [partitionBy=''] An optional string specifying the column(s) to partition the table by. If omitted, the table will not be partitioned.
 * @param {string} [clusterBy=''] An optional string specifying the column(s) to cluster the table by. If omitted, the table will not be clustered.
 * 
 * @returns {string} A BigQuery SQL script that conditionally creates or replaces the specified table with the given schema, partitioning, and clustering options.
 * This script includes logic to first check if the table meets certain existing schema criteria before proceeding to create or replace the table.
 */
function createOrReplaceTableInplace(ctx, schemaDefinition, clusterBy = '', partitionBy = '') {
    const tableDeconstruct = ctx.self().replace(/`/g, '').split('.');
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
            CREATE OR REPLACE TABLE ${ctx.self()}
            ${schemaDefinition}
            ${partitionStatement}
            ${clusterStatement}
            AS
            SELECT
              *
            FROM
              ${ctx.self()};
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
function getPrimaryKeys(columnsDefinition, alias = true) {
    const ctx = { ref: (tableName) => tableName }; // Mocked ctx
    const columns = typeof columnsDefinition === 'function' ? columnsDefinition(ctx) : columnsDefinition;

    return columns
        .filter(col => col.constraints && col.constraints.some(constraint => constraint.includes('PRIMARY KEY')))
        .map(col => {
            // Extract original column name from within any function calls
            const originalColumnName = col.name.replace(/.*\(([^)]+)\).*/, '$1').trim();

            // Return alias, original column name within function, or plain name based on alias flag
            return alias ? col.alias || originalColumnName : originalColumnName;
        });
}

/**
 * Generates an array of column definitions for a simple dimensional table based on a given dimension entity source name.
 * The function constructs two columns typically found in dimensional tables: an ID column and a name column. 
 * The ID column is marked as a primary key and not nullable, and the name column is also not nullable.
 * 
 * @param {string} dimEntitySource The base name of the dimension entity, which is used to construct the column names.
 * For example, if 'dimEntitySource' is 'customer', the resulting columns would be named 'customerId' (with an alias of 'id') 
 * and 'customer' (with an alias of 'name'), respectively.
 * 
 * @returns {Array<Object>} An array containing two column definition objects. The first object defines the primary key ID column,
 * and the second object defines the name column. Each object includes properties for the column's name, type, alias, 
 * and any constraints (such as 'PRIMARY KEY' for the ID column).
 */
const simpleDimColumns = (dimEntitySource) => [
    { name: `${dimEntitySource}Id`, type: 'STRING NOT NULL', alias: 'id', constraints: [
        'PRIMARY KEY'] },
    { name: `${dimEntitySource}`, type: 'STRING NOT NULL', alias: 'name' }
];

function simpleDimSchema(primaryKey) {
    return `
        id STRING NOT NULL,
        name STRING NOT NULL,
        PRIMARY KEY (${primaryKey}) NOT ENFORCED
`}

module.exports = {
    generateSelectColumns,
    generateSchemaDefinition,
    getPrimaryKeys,
    getNotNullColumns,
    createOrReplaceTableInplace,
    simpleDimSchema,
    simpleDimColumns
}
