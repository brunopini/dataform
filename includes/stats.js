const {
    targetSchemaSuffix
} = require('config.js');
const {
    lookBackDate,
    clusterBy,
} = require("includes/utils.js");


const primaryKeyRaw = ["Day", "AdId", "AdvertiserId", "CouponId", "ChannelId", "Device", "MarketingObjectiveId", "Os"];
const primaryKey = ["date", "ad_id", "advertiser_id", "coupon_id", "channel_id", "device", "marketing_objective_id", "os"];
const nonNullAssert = ["date", "ad_id", "adset_id", "advertiser_id", "campaign_id", "category_id", "channel_id", "coupon_id", "currency", "device", "marketing_objective_id", "os"];

const viewConfig = {
    type: 'view',
    assertions: {
        uniqueKey: primaryKey,
        nonNull: nonNullAssert
    },
    tags: ['staging', 'view']
};

const tableConfig = {
    type: "incremental",
    uniqueKey: primaryKey,
    assertions: {
        uniqueKey: primaryKey,
        nonNull: nonNullAssert,
    },
    bigquery: {
        clusterBy: [clusterBy],
        partitionBy: "date",
        updatePartitionFilter: `date >= ${lookBackDate('DATE(CURRENT_TIMESTAMP())')}`
    }
};

function statsSchemaDimensions(metricsSchema, ctx) {
    return `
    ad_id STRING NOT NULL,
    adset_id STRING NOT NULL,
    advertiser_id STRING NOT NULL,
    campaign_id STRING NOT NULL,
    category_id STRING NOT NULL,
    channel_id STRING NOT NULL,
    coupon_id STRING NOT NULL,
    currency STRING NOT NULL,
    date DATE NOT NULL,
    device STRING NOT NULL,
    marketing_objective_id STRING NOT NULL,
    os STRING NOT NULL,
    ${metricsSchema},
    PRIMARY KEY(${primaryKey}) NOT ENFORCED,
    FOREIGN KEY (ad_id, advertiser_id) REFERENCES ${ctx.ref(targetSchemaSuffix, 'dim_ad')}(id, advertiser_id) NOT ENFORCED,
    FOREIGN KEY (adset_id, advertiser_id) REFERENCES ${ctx.ref(targetSchemaSuffix, 'dim_adset')}(id, advertiser_id) NOT ENFORCED,
    FOREIGN KEY (campaign_id, advertiser_id) REFERENCES ${ctx.ref(targetSchemaSuffix, 'dim_campaign')}(id, advertiser_id) NOT ENFORCED,
    FOREIGN KEY (coupon_id, advertiser_id) REFERENCES ${ctx.ref(targetSchemaSuffix, 'dim_coupon')}(id, advertiser_id) NOT ENFORCED,
    FOREIGN KEY (category_id) REFERENCES ${ctx.ref(targetSchemaSuffix, 'dim_category')}(id) NOT ENFORCED,
    FOREIGN_KEY (channel_id) REFERENCES ${ctx.ref(targetSchemaSuffix, 'dim_channel')}(id) NOT ENFORCED,
    FOREIGN KEY (marketing_objective_id) REFERENCES ${ctx.ref(targetSchemaSuffix, 'dim_marketing_objective')}(id) NOT ENFORCED,
    `
};

const baseColumns = (ctx, tableAlias = '') => [
    { name: `DATE(${tableAlias}Day)`, type: 'STRING NOT NULL', alias: 'date', constraints: [
        'PRIMARY KEY'] },
    { name: `${tableAlias}AdId`, type: 'STRING NOT NULL', alias: 'ad_id', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY (advertiser_id) ${ctx.ref(targetSchemaSuffix, 'dim_ad')}(id, advertiser_id)`] },
    { name: `${tableAlias}MarketingObjectiveId`, type: 'STRING NOT NULL', alias: 'marketing_objective_id', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY ${ctx.ref(targetSchemaSuffix, 'dim_marketing_objective')}(id)`]},
    { name: `${tableAlias}ChannelId`, type: 'STRING NOT NULL', alias: 'channel_id', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY ${ctx.ref(targetSchemaSuffix, 'dim_category')}(id)`] },
    { name: `${tableAlias}CategoryId`, type: 'STRING NOT NULL', alias: 'category_id', constraints: [
        `FOREIGN KEY (advertiser_id) ${ctx.ref(targetSchemaSuffix, 'dim_category')}(id, advertiser_id)`] },
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

function statsSelectDimensions(tableAlias = '') {
    const prefix = tableAlias ? `${tableAlias}.` : '';

    return `
        ${prefix}AdId AS ad_id,
        ${prefix}AdsetId AS adset_id,
        ${prefix}AdvertiserId AS advertiser_id,
        ${prefix}CampaignId AS campaign_id,
        ${prefix}CategoryId AS category_id,
        ${prefix}ChannelId AS channel_id,
        ${prefix}CouponId AS coupon_id,
        ${prefix}Currency AS currency,
        DATE(${prefix}Day) AS date,
        ${prefix}Device AS device,
        ${prefix}MarketingObjectiveId AS marketing_objective_id,
        ${prefix}Os AS os,
    `
};

module.exports = {
    primaryKeyRaw,
    viewConfig,
    tableConfig,
    statsSelectDimensions,
    statsSchemaDimensions,
    baseColumns
};
