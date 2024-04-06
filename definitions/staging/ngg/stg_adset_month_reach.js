const {
    nggReachSelect
} = require('includes/reach.js');

// Column mappings
const sourceEntity = 'AdsetId';
const targetTimeframe = 'month';
const sourceTimeframe = 'Month';

// Static
const primaryKey = [targetTimeframe, 'id', 'advertiser_id'];

publish('stg_adset_month_reach', {
    type: 'view',
    assertions: {
        uniqueKey: primaryKey,
        nonNull: primaryKey
    },
    tags: ['staging', 'view', 'ngg']
}).query(ctx => `
    SELECT ${nggReachSelect(sourceEntity, sourceTimeframe, targetTimeframe)}
    FROM ${ctx.ref('user_agg_adset_month')}
`)
