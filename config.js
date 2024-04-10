const sourceSchemaSuffix = 'ab_criteo_marketing';
const targetSchemaSuffix = 'criteo_marketing';
const lookBackDays = '30';

const businessUnits = [
    {
        schemaPrefix: 'globoplay',
        accountsTablePrefixes: ['account',]
    },
];

// Test

module.exports = {
    sourceSchemaSuffix,
    targetSchemaSuffix,
    lookBackDays,
    businessUnits
}
