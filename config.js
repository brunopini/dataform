const sourceSchemaSuffix = 'ab_criteo_marketing';
const targetSchemaSuffix = 'criteo_marketing';

const businessUnits = [
    {
        schemaPreffix: 'globoplay',
        accountsTablePreffixes: ['account', 'account2']
    },
    {
        schemaPreffix: 'product2',
        accountsTablePreffixes: ['account3']
    }
];

module.exports = {
    sourceSchemaSuffix,
    targetSchemaSuffix,
    businessUnits
}
