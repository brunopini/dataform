const sourceSchemaSuffix = 'ab_winclap';
const targetSchemaSuffix = 'winclap';
const lookBackDays = '30';

const businessUnits = [
    {
        schemaPrefix: 'globoplay',
        accountsTablePrefixes: ['comgloboglobotv',]
    },
];

module.exports = {
    sourceSchemaSuffix,
    targetSchemaSuffix,
    lookBackDays,
    businessUnits
}
