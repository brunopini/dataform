const clusterBy = "advertiser_id";

const lookBackDays = "30";

const dimPrimaryKey = ["id", "advertiser_id"];

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

function generateSimpleSelectStatement(ctx, columns, schema, table, distinct = false) {
  // Assuming columns is an array of column names you want to select
  const columnsPart = Array.isArray(columns) ? columns.join(", ") : columns;
  return `SELECT ${distinct ? 'DISTINCT ' : ''}${columnsPart} FROM ${ctx.ref(schema, table)}`;
}

function generateUnionAllQuery(
    ctx, columns, sourceSchemaSuffix, sourceTableSuffix, businessUnit,
    accountsLevel = true, distinct = false) {
  let unionAllQueryParts = [];

  const schemaName = `${businessUnit.schemaPreffix}_${sourceSchemaSuffix}`;

  if (accountsLevel) {
    businessUnit.accountsTablePreffixes.forEach(accountPrefix => {
      const sourceTableName = `${accountPrefix}_${sourceTableSuffix}`;
      // Generate the SELECT statement for this table
      const selectStatement = generateSimpleSelectStatement(ctx, columns, schemaName, sourceTableName, distinct);
      // Add the SELECT statement to the parts array
      unionAllQueryParts.push(selectStatement);
    });
  } else {
    // If accountsLevel is false, generate a select statement without iterating over accounts
    const sourceTableName = `${sourceTableSuffix}`;
    const selectStatement = generateSimpleSelectStatement(ctx, columns, schemaName, sourceTableName, distinct);
    unionAllQueryParts.push(selectStatement);
  }

  return unionAllQueryParts.join(" UNION ALL ");
}

module.exports = {
    clusterBy,
    dimPrimaryKey,
    extractAttribute,
    extractArrayAttribute,
    lookBackDate,
    joinOn,
    metricsTypeDeclarations,
    removeTrailingComma,
    generateSimpleSelectStatement,
    generateUnionAllQuery
};
