const {
    nggReachSelect
} = require('includes/reach.js');

// Column mappings
const sourceEntity = 'CampaignId';
const targetTimeframe = 'week';
const sourceTimeframe = 'Week';

// Static
const primaryKey = [targetTimeframe, 'id', 'advertiser_id'];

publish('stg_campaign_week_reach', {
    type: 'view',
    assertions: {
        uniqueKey: primaryKey,
        nonNull: primaryKey
    },
    tags: ['staging', 'view', 'dim', 'ngg']
}).query(ctx => `
    SELECT ${nggReachSelect(sourceEntity, sourceTimeframe, targetTimeframe)}
    FROM ${ctx.ref('user_agg_campaign_week')}
`)
