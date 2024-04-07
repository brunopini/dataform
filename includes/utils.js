const { 
  lookBackDays
} = require('config.js');


function extractAttribute(attribute) {
    return `JSON_EXTRACT_SCALAR(attributes, '$.${attribute}')`;
}

function extractArrayAttribute(attribute) {
    return `ARRAY(
      SELECT JSON_EXTRACT_SCALAR(item, '$')
      FROM UNNEST(
        JSON_EXTRACT_ARRAY(attributes, '$.${attribute}')
      ) AS item)`;
}

function lookBackDate(dateConstruct) {
    return `DATE(TIMESTAMP_SUB(${dateConstruct}, INTERVAL ${lookBackDays} DAY))`
}

function joinOn(keys, leftAlias, rightAlias) {
  let leftKeys = keys.map(columnName => `${leftAlias}.${columnName}`).join(',\n    ');
  let rightKeys = keys.map(columnName => `${rightAlias}.${columnName}`).join(',\n    ');
  let on = `(${leftKeys})\n= (${rightKeys})`;
  return on;
}

function metricsTypeDeclarations(metricsSelect) {
  // Split the input string into individual lines
  const lines = metricsSelect.split(',\n');

  // Initialize an array to hold the formatted declarations
  let declarations = [];

  // Adjusted regular expression to match the input pattern more accurately
  const regex = /CAST\((?:\w+\.)?\w+ AS (\w+)\) AS (\w+)/;

  // Iterate over each line
  for (let line of lines) {
    const match = line.trim().match(regex);
    if (match) {
      // Correctly extract the type and alias based on the adjusted capturing groups
      const type = match[1];
      const alias = match[2];
      // Format and add the declaration to the array
      declarations.push(`${alias} ${type}`);
    }
  }

  // Join the declarations with a newline character for readability, removed trailing comma for correct syntax
  return `${declarations.join(',\n')},`;
}

function removeTrailingComma(inputString) {
  // Use a regular expression to match a trailing comma possibly followed by whitespace, before the end of the string
  const regex = /,\s*$/;
  
  // Replace the matched pattern with an empty string, effectively removing it
  return inputString.replace(regex, '');
}

/**
 * Generates a simple SQL SELECT statement based on the provided parameters.
 * This function allows specifying columns, schema, table, distinct modifier, and conditions for the WHERE clause.
 * The WHERE conditions can be provided as either a string or an array of condition strings.
 *
 * @param {Object} ctx - The context object containing the `ref` function to reference schema and table correctly.
 * @param {Array|string} columns - An array of column names to select, or a single column name as a string.
 * @param {string} schema - The schema name of the table to select from.
 * @param {string} table - The table name to select from.
 * @param {boolean} [distinct=false] - Optional. Specifies whether to add the DISTINCT keyword to the SELECT statement.
 * @param {Array|string} [whereConditions=[]] - Optional. Conditions for the WHERE clause. 
 *                                               Can be a single condition as a string, or an array of conditions. 
 *                                               If a string is provided, it can optionally start with "WHERE". 
 *                                               If an array is provided, each element should be a single condition string.
 *
 * @returns {string} A SQL SELECT statement as a string.
 *
 * @example
 * // Returns: SELECT DISTINCT column1, column2 FROM schemaName.tableName WHERE column1 = 'value1' AND column2 > 10
 * generateSelectStatement(ctx, ['column1', 'column2'], 'schemaName', 'tableName', true, ["column1 = 'value1'", "column2 > 10"]);
 *
 * @example
 * // Returns: SELECT * FROM schemaName.tableName WHERE column1 = 'value1'
 * generateSelectStatement(ctx, '*', 'schemaName', 'tableName', false, "column1 = 'value1'");
 */
function generateSelectStatement(
    ctx, columns, schema, table, distinct = false, whereConditions = []) {
  // Assuming columns is an array of column names you want to select
  const columnsPart = Array.isArray(columns) ? columns.join(', ') : columns;

  // Prepare the WHERE part
  let wherePart = '';
  if (typeof whereConditions === 'string' && whereConditions.trim() !== '') {
    // If it's a non-empty string, directly use it, ensuring it starts with 'WHERE '
    wherePart = whereConditions.trim().toUpperCase().startsWith('WHERE ') ? whereConditions.trim() : 'WHERE ' + whereConditions.trim();
  } else if (Array.isArray(whereConditions) && whereConditions.length > 0) {
    // If it's an array, join the conditions with ' AND ', prefixed by 'WHERE '
    wherePart = 'WHERE ' + whereConditions.join(' AND ');
  }

  // Construct the SQL statement
  return `SELECT ${distinct ? 'DISTINCT ' : ''}${columnsPart} FROM ${ctx.ref(schema, table)} ${wherePart}`;
}

function generateUnionAllQuery(
    ctx, columns, sourceSchemaSufix, sourceTableSufix, businessUnit,
    accountsLevel = true, distinct = false, whereConditions = []) {
  let unionAllQueryParts = [];

  const schemaName = `${businessUnit.schemaPrefix}_${sourceSchemaSufix}`;

  if (accountsLevel) {
    businessUnit.accountsTablePrefixes.forEach(accountPrefix => {
      const sourceTableName = `${accountPrefix}_${sourceTableSufix}`;
      // Generate the SELECT statement for this table
      const selectStatement = generateSelectStatement(ctx, columns, schemaName, sourceTableName, distinct);
      // Add the SELECT statement to the parts array
      unionAllQueryParts.push(selectStatement);
    });
  } else {
    // If accountsLevel is false, generate a select statement without iterating over accounts
    const sourceTableName = `${sourceTableSufix}`;
    const selectStatement = generateSelectStatement(ctx, columns, schemaName, sourceTableName, distinct);
    unionAllQueryParts.push(selectStatement);
  }

  return unionAllQueryParts.join(" UNION ALL ");
}

function generateJoinQueryForAccounts(
    ctx, columns, sourceSchemaSufix, tablePrefix, tableSuffixes, onKeys,
    baseTableAlias, businessUnit) {
  let tablesToJoin = tableSuffixes.map(table => `${tablePrefix}_${table}`);
  const baseTable = tablesToJoin.shift(); // Assuming the first table is the base for joining others
  let baseQuery = `
      SELECT
      ${columns}
      FROM
      ${ctx.ref(`${businessUnit.schemaPrefix}_${sourceSchemaSufix}`, baseTable)} t0 
  `;

  tablesToJoin.forEach((table, index) => {
      const tableAlias = `t${index + 1}`;
      baseQuery += `
          JOIN ${ctx.ref(`${businessUnit.schemaPrefix}_${sourceSchemaSufix}`, table)} ${tableAlias}
          ON ${joinOn(onKeys, baseTableAlias, tableAlias)}\n
      `;
  });
  return baseQuery;
}

module.exports = {
    extractAttribute,
    extractArrayAttribute,
    lookBackDate,
    joinOn,
    metricsTypeDeclarations,
    removeTrailingComma,
    generateSelectStatement,
    generateUnionAllQuery,
    generateJoinQueryForAccounts
};
