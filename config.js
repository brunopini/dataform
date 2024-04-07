const sourceSchemaSuffix = 'ab_criteo_marketing';
const targetSchemaSuffix = 'criteo_marketing';

const businessUnits = [
    {
        schemaPreffix: 'globoplay',
        accountsTablePreffixes: ['account']
    }
];

module.exports = {
    sourceSchemaSuffix,
    targetSchemaSuffix,
    businessUnits
}
