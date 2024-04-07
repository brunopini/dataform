const sourceSchemaSufix = 'ab_criteo_marketing';
const targetSchemaSufix = 'criteo_marketing';
const lookBackDays = '30';

const businessUnits = [
    {
        schemaPrefix: 'globoplay',
        accountsTablePrefixes: ['account', 'account2']
    },
    {
        schemaPrefix: 'product2',
        accountsTablePrefixes: ['account3']
    }
];

module.exports = {
    sourceSchemaSufix,
    targetSchemaSufix,
    lookBackDays,
    businessUnits
}
