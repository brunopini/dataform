const {
    targetSchemaSuffix
} = require('config.js');


const dimColumns = (ctx) => [
    { name: `DATE(summary_date)`, type: 'DATE NOT NULL', alias: 'date', constraints: [
        'PRIMARY KEY'] },
    { name: `ad_id`, type: 'STRING NOT NULL', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY (app_id) ${ctx.ref(targetSchemaSuffix, 'dim_ad')}(id, app_id)`] },
    { name: `media_source`, type: 'DATE NOT NULL', alias: 'date', constraints: [
        'PRIMARY KEY'] },
    { name: `platform`, type: 'DATE NOT NULL', alias: 'date', constraints: [
        'PRIMARY KEY'] },
    // { name: `ad_set_id`, type: 'STRING NOT NULL', alias: 'adset_id', constraints: [
    //     `FOREIGN KEY (app_id) ${ctx.ref(targetSchemaSuffix, 'dim_adset')}(id, app_id)`] },
    // { name: `campaign_id`, type: 'STRING NOT NULL', constraints: [
    //     `FOREIGN KEY (app_id) ${ctx.ref(targetSchemaSuffix, 'dim_campaign')}(id, app_id)`] },
    { name: `app_id`, type: 'STRING NOT NULL', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY ${ctx.ref(targetSchemaSuffix, 'dim_app')}(id)`] },
];

module.exports = {
    dimColumns
}
