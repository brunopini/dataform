const {
    lookBackDate,
    clusterBy,
} = require("includes/utils.js");

const primaryKeyRaw = ["Day", "AdId", "AdvertiserId", "CouponId", "ChannelId", "Device", "MarketingObjectiveId", "Os"];
const primaryKey = ["date", "ad_id", "advertiser_id", "coupon_id", "channel_id", "device", "marketing_objective_id", "os"];
const nonNullAssert = ["date", "ad_id", "adset_id", "advertiser_id", "campaign_id", "category_id", "channel_id", "coupon_id", "currency", "device", "marketing_objective_id", "os"];

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
        category_id STRING NOT NULL REFERENCES ${ctx.ref('dim_category')}(id) NOT ENFORCED,
        channel_id STRING NOT NULL REFERENCES ${ctx.ref('dim_channel')}(id) NOT ENFORCED,
        coupon_id STRING NOT NULL,
        currency STRING NOT NULL,
        date DATE NOT NULL,
        device STRING NOT NULL,
        marketing_objective_id STRING NOT NULL REFERENCES ${ctx.ref('dim_marketing_objective')}(id) NOT ENFORCED,
        os STRING NOT NULL,
        ${metricsSchema},
        PRIMARY KEY(${primaryKey}) NOT ENFORCED,
        FOREIGN KEY (ad_id, advertiser_id) REFERENCES ${ctx.ref('dim_ad')}(id, advertiser_id) NOT ENFORCED,
        FOREIGN KEY (adset_id, advertiser_id) REFERENCES ${ctx.ref('dim_adset')}(id, advertiser_id) NOT ENFORCED,
        FOREIGN KEY (campaign_id, advertiser_id) REFERENCES ${ctx.ref('dim_campaign')}(id, advertiser_id) NOT ENFORCED,
        FOREIGN KEY (coupon_id, advertiser_id) REFERENCES ${ctx.ref('dim_coupon')}(id, advertiser_id) NOT ENFORCED,
    `
};

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
    tableConfig,
    statsSelectDimensions,
    statsSchemaDimensions,
};
