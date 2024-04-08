const {
    targetSchemaSuffix
} = require('config.js');


const baseColumns = (ctx, tableAlias = '') => [
    { name: `DATE(${tableAlias}Day)`, type: 'DATE NOT NULL', alias: 'date', constraints: [
        'PRIMARY KEY'] },
    { name: `${tableAlias}AdId`, type: 'STRING NOT NULL', alias: 'ad_id', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY (advertiser_id) ${ctx.ref(targetSchemaSuffix, 'dim_ad')}(id, advertiser_id)`] },
    { name: `${tableAlias}MarketingObjectiveId`, type: 'STRING NOT NULL', alias: 'marketing_objective_id', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY ${ctx.ref(targetSchemaSuffix, 'dim_marketing_objective')}(id)`]},
    { name: `${tableAlias}ChannelId`, type: 'STRING NOT NULL', alias: 'channel_id', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY ${ctx.ref(targetSchemaSuffix, 'dim_channel')}(id)`] },
    { name: `${tableAlias}CategoryId`, type: 'STRING NOT NULL', alias: 'category_id', constraints: [
        `FOREIGN KEY ${ctx.ref(targetSchemaSuffix, 'dim_category')}(id)`] },
    { name: `${tableAlias}CouponId`, type: 'STRING NOT NULL', alias: 'coupon_id', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY (advertiser_id) ${ctx.ref(targetSchemaSuffix, 'dim_coupon')}(id, advertiser_id)`] },
    { name: `${tableAlias}AdvertiserId`, type: 'STRING NOT NULL', alias: 'advertiser_id', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY ${ctx.ref(targetSchemaSuffix, 'dim_advertiser')}(id)`] },
    { name: `${tableAlias}Device`, type: 'STRING NOT NULL', alias: 'device', constraints: [
        'PRIMARY KEY'] },
    { name: `${tableAlias}Os`, type: 'STRING NOT NULL', alias: 'os', constraints: [
        'PRIMARY KEY'] },
    { name: `${tableAlias}AdsetId`, type: 'STRING NOT NULL', alias: 'adset_id', constraints: [
        `FOREIGN KEY (advertiser_id) ${ctx.ref(targetSchemaSuffix, 'dim_adset')}(id, advertiser_id)`] },
    { name: `${tableAlias}CampaignId`, type: 'STRING NOT NULL', alias: 'campaign_id', constraints: [
        `FOREIGN KEY (advertiser_id) ${ctx.ref(targetSchemaSuffix, 'dim_campaign')}(id, advertiser_id)`] },
    { name: `${tableAlias}Currency`, type: 'STRING NOT NULL', alias: 'currency'},
];

module.exports = {
    // statsSelectDimensions,
    // statsSchemaDimensions,
    baseColumns
}
