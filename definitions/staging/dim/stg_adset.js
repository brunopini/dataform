const {
    sourceSchemaSuffix,
    businessUnits
} = require('config.js');
const {
    extractAttribute,
    generateUnionAllQuery
    // extractArrayAttribute,
} = require('includes/utils.js');
const {
    getNotNullColumns,
    getPrimaryKeys,
    generateSelectColumns
} = require('includes/schema.js');


// Adset Attributes
// Flat Attributes
const adsetName = extractAttribute('name');
const destinationEnvironment = extractAttribute('destinationEnvironment');
const mediaType = extractAttribute('mediaType');
const datasetId = extractAttribute('datasetId');
const campaignId = extractAttribute('campaignId');
const advertiserId = extractAttribute('advertiserId');
// Schedule Attributes
const startDate = `CAST(${extractAttribute('schedule.startDate.value')} AS TIMESTAMP)`;
const endDate = `CAST(${extractAttribute('schedule.endDate.value')} AS TIMESTAMP)`;
const activationStatus = extractAttribute('schedule.activationStatus');
const deliveryStatus = extractAttribute('schedule.deliveryStatus');
// Targeting Attributes
// const countryOperand = extractAttribute('targeting.geoLocation.countries.value.operand');
// const countries = extractArrayAttribute('targeting.geoLocation.countries.value.values');
// const subdivisions = extractArrayAttribute('targeting.geoLocation.subdivisions.value');
// const zipCodes = extractArrayAttribute('targeting.geoLocation.zipCodes.value');
const frequencyCap = `CAST(${extractAttribute('targeting.frequencyCapping.frequency.value')} AS NUMERIC)`;
const maximumImpressions = `CAST(${extractAttribute('targeting.frequencyCapping.maximumImpressions.value')} AS NUMERIC)`;
const frequencyCapMode = extractAttribute('targeting.frequencyCapping.mode');
// const devices = extractArrayAttribute('targeting.deliveryLimitations.devices');
// const environments = extractArrayAttribute('targeting.deliveryLimitations.environments');
// const operatingSystems = extractArrayAttribute('targeting.deliveryLimitations.operatingSystems');
// Bidding Attributes
const bidAmount = `CAST(${extractAttribute('bidding.bidAmount.value')} AS NUMERIC)`;
const bidStrategy = extractAttribute('bidding.bidStrategy');
const costController = extractAttribute('bidding.costController');
// Budget Attributes
const budget = `CAST(${extractAttribute('budget.budgetAmount.value')} AS NUMERIC)`;
const budgetDeliverySmoothing = extractAttribute('budget.budgetDeliverySmoothing');
const budgetDeliveryWeek = extractAttribute('budget.budgetDeliveryWeek');
const budgetRenewal = extractAttribute('budget.budgetRenewal');
const budgetStrategy = extractAttribute('budget.budgetStrategy');
// const objective = extractAttribute('objective');

// Schema
const columns = (ctx) => [
    { name: 'id', type: 'STRING NOT NULL', constraints: [
        'PRIMARY KEY'] },
    { name: adsetName, type: 'STRING NOT NULL', alias: 'name' },
    { name: destinationEnvironment, type: 'STRING NOT NULL', alias: 'destination_environment' },
    { name: mediaType, type: 'STRING NOT NULL', alias: 'media_type' },
    { name: datasetId, type: 'STRING NOT NULL', alias: 'dataset_id' },
    { name: campaignId, type: 'STRING NOT NULL', alias: 'campaign_id', constraints: [
        `FOREIGN KEY (advertiser_id) ${ctx.ref('dim_campaign')}(id, advertiser_id)`] },
    { name: advertiserId, type: 'STRING NOT NULL', alias: 'advertiser_id', constraints: [
        'PRIMARY KEY',
        `FOREIGN KEY ${ctx.ref('dim_advertiser')}(id)`] },
    { name: startDate, type: 'TIMESTAMP NOT NULL', alias: 'start_date' },
    { name: endDate, type: 'TIMESTAMP NOT NULL', alias: 'end_date' },
    { name: activationStatus, type: 'STRING NOT NULL', alias: 'activation_status' },
    { name: deliveryStatus, type: 'STRING NOT NULL', alias: 'delivery_status' },
    { name: frequencyCap, type: 'NUMERIC', alias: 'frequency_cap' },
    { name: maximumImpressions, type: 'NUMERIC', alias: 'max_impressions' },
    { name: frequencyCapMode, type: 'STRING', alias: 'frequency_cap_mode' },
    { name: bidAmount, type: 'NUMERIC', alias: 'bid_amount' },
    { name: bidStrategy, type: 'STRING', alias: 'bid_strategy' },
    { name: costController, type: 'STRING', alias: 'cost_controller' },
    { name: budget, type: 'NUMERIC', alias: 'budget' },
    { name: budgetDeliverySmoothing, type: 'STRING', alias: 'budget_delivery_smoothing' },
    { name: budgetDeliveryWeek, type: 'STRING', alias: 'budget_delivery_week' },
    { name: budgetRenewal, type: 'STRING', alias: 'budget_renewal' },
    { name: budgetStrategy, type: 'STRING', alias: 'budget_strategy' },
];

const uniqueAssertion = getPrimaryKeys(columns);
const nonNullAssertion = getNotNullColumns(columns);


businessUnits.forEach(businessUnit => {
    publish('stg_adset', {
        type: 'view',
        schema: `${businessUnit.schemaPreffix}_${sourceSchemaSuffix}`,
        assertions: {
            uniqueKey: uniqueAssertion,
            nonNull: nonNullAssertion
        },
        tags: ['staging', 'view', 'dim']
    }).query(ctx => generateUnionAllQuery(
        ctx, generateSelectColumns(ctx, columns),
        sourceSchemaSuffix, 'ads', businessUnit)
    )
})


module.exports = {
    columns,
    uniqueAssertion,
    nonNullAssertion
}
