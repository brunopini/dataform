const clusterBy = "advertiser_id";

const lookBackDays = "30";

const dimPrimaryKey = ["id", "advertiser_id"];

function extractAttribute(attribute) {
    return `JSON_EXTRACT_SCALAR(attributes, '$.${attribute}')`;
};

// function extractJsonAttribute(attribute) {
//     return `JSON_EXTRACT(attributes, '$.${attribute}')`;
// };

function extractArrayAttribute(attribute) {
    return `ARRAY(
      SELECT JSON_EXTRACT_SCALAR(item, '$')
      FROM UNNEST(
        JSON_EXTRACT_ARRAY(attributes, '$.${attribute}')
      ) AS item)`;
};

function lookBackDate(dateConstruct) {
    return `DATE(TIMESTAMP_SUB(${dateConstruct}, INTERVAL ${lookBackDays} DAY))`
};

function joinOn(keys, leftAlias, rightAlias) {
  let leftKeys = keys.map(columnName => `${leftAlias}.${columnName}`).join(',\n    ');
  let rightKeys = keys.map(columnName => `${rightAlias}.${columnName}`).join(',\n    ');
  let on = `(${leftKeys})\n= (${rightKeys})`;
  return on;
};

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
};

function removeTrailingComma(inputString) {
  // Use a regular expression to match a trailing comma possibly followed by whitespace, before the end of the string
  const regex = /,\s*$/;
  
  // Replace the matched pattern with an empty string, effectively removing it
  return inputString.replace(regex, '');
};

module.exports = {
    clusterBy,
    dimPrimaryKey,
    extractAttribute,
    extractArrayAttribute,
    // extractJsonAttribute,
    lookBackDate,
    joinOn,
    metricsTypeDeclarations,
    removeTrailingComma,
};
