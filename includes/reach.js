function nggReachSchema(timeframe, primaryKey, ctx, entity) {
    return `
        id STRING NOT NULL,
        advertiser_id STRING NOT NULL REFERENCES ${ctx.ref('dim_advertiser')}(id) NOT ENFORCED,
        ${timeframe} DATE NOT NULL,
        audience_size NUMERIC,
        exposed_users NUMERIC,
        visits NUMERIC,
        qualified_visits NUMERIC,
        PRIMARY KEY (${primaryKey}) NOT ENFORCED,
        FOREIGN KEY (id, advertiser_id) REFERENCES ${ctx.ref(`dim_${entity}`)}(id, advertiser_id) NOT ENFORCED
    `
};

function nggReachSelect(entityRaw, timeframeRaw, timeframeNew) {
    return `
      ${entityRaw} AS id,
      AdvertiserId AS advertiser_id,
      DATE(${timeframeRaw}) AS ${timeframeNew},
      CAST(Audience AS NUMERIC) AS audience_size,
      CAST(ExposedUsers AS NUMERIC) AS exposed_users,
      CAST(Visits AS NUMERIC) AS visits,
      CAST(QualifiedVisits AS NUMERIC) AS qualified_visits,
    `
};

module.exports = {
    nggReachSchema,
    nggReachSelect
};
