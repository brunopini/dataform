const sourceSchemaSufix = 'ab_criteo_marketing';
const targetSchemaSufix = 'criteo_marketing';
const lookBackDays = '30';

const businessUnits = [
    {
        schemaPrefix: 'globoplay',
        accountsTablePrefixes: ['account',]
    }
];

module.exports = {
    sourceSchemaSufix,
    targetSchemaSufix,
    lookBackDays,
    businessUnits
}
