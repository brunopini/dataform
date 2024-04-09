const {
    businessUnits
} = require('config.js');
const {
    declareSchemaIsSet,
    generateSchemaDefinition,
    createOrReplaceTableInplace,
    getNotNullColumns,
    getPrimaryKeys
} = require('includes/schema.js');


const columns = (ctx) => [
    { name: 'business_unit', type: 'STRING NOT NULL', constraints: [
        'PRIMARY KEY'] },
    { name: 'advertiser_id', type: 'STRING NOT NULL', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY ${ctx.ref('dim_advertiser')}(id)`] }
];
                
const uniqueAssertion = getPrimaryKeys(columns);
const nonNullAssertion = getNotNullColumns(columns);
const clusterBy = ['advertiser_id'];


publish('dim_business_unit', {
    type: 'table',
    assertions: {
        uniqueKey: uniqueAssertion,
        nonNull: nonNullAssertion
    },
    bigquery: {
        clusterBy: clusterBy
    }
}).query(ctx => `
    INSERT INTO ${ctx.self()} (business_unit, advertiser_id)
    VALUES ${
        businessUnits.map(
            unit => unit.accountsTablePrefixes.map(
                prefix => `('${unit.schemaPrefix}', '${prefix}')`
            ).join(", ")
        ).join(", ")}
`).preOps(
    declareSchemaIsSet
).postOps(ctx => createOrReplaceTableInplace(ctx, generateSchemaDefinition(ctx, columns), clusterBy));
