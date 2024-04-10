const {
    sourceSchemaSuffix,
    businessUnits
} = require('config.js')


const sourceStreams = [
    'ad_set_reports_stream'
];


businessUnits.forEach(businessUnit => {
    const schemaName = `${businessUnit.schemaPrefix}_${sourceSchemaSuffix}`;
  
    businessUnit.accountsTablePrefixes.forEach(account => {
      sourceStreams.forEach(table => {
        const tableName = `${account}_${table}`;
  
        declare({
          schema: schemaName,
          name: tableName
        });
      });
    });
  });
