const {
    dimPrimaryKey,
    extractAttribute,
    extractArrayAttribute,
} = require("includes/utils.js");
const {
    createOrReplaceTable
} = require('includes/schema.js');

// Config
const bigqueryConfig = {};
const assertionsConfig = {
    uniqueKey: dimPrimaryKey,
    nonNull: ["id", "type", "name", "campaign_id", "advertiser_id"]
};

// Table names
const targetTable = 'dim_adset';
const sourceTable = 'adsets';

// Adset Attributes
// Schedule Attributes
const activationStatus = extractAttribute('schedule.activationStatus');
const deliveryStatus = extractAttribute('schedule.deliveryStatus');
const endDate = extractAttribute('schedule.endDate.value');
const startDate = extractAttribute('schedule.startDate.value');
// Targeting Attributes
const countryOperand = extractAttribute('targeting.geoLocation.countries.value.operand');
const countries = extractArrayAttribute('targeting.geoLocation.countries.value.values');
const subdivisions = extractArrayAttribute('targeting.geoLocation.subdivisions.value');
const zipCodes = extractArrayAttribute('targeting.geoLocation.zipCodes.value');
const frequencyCap = extractAttribute('targeting.frequencyCapping.frequency.value');
const maximumImpressions = extractAttribute('targeting.frequencyCapping.maximumImpressions.value');
const frequencyCapMode = extractAttribute('targeting.frequencyCapping.mode');
const devices = extractArrayAttribute('targeting.deliveryLimitations.devices');
const environments = extractArrayAttribute('targeting.deliveryLimitations.environments');
const operatingSystems = extractArrayAttribute('targeting.deliveryLimitations.operatingSystems');
// Bidding Attributes
const bidAmount = extractAttribute('bidding.bidAmount.value');
const bidStrategy = extractAttribute('bidding.bidStrategy');
const costControler = extractAttribute('bidding.costController');
// Budget Attributes
const budget = extractAttribute('budget.budgetAmount.value');
const budgetDeliverySmoothing = extractAttribute('budget.budgetDeliverySmoothing');
const budgetDeliveryWeek = extractAttribute('budget.budgetDeliveryWeek');
const budgetRenewal = extractAttribute('budget.budgetRenewal');
const budgetStrategy = extractAttribute('budget.budgetStrategy');
// Flat Attributes
const campaignId = extractAttribute('campaignId');
const datasetId = extractAttribute('datasetId');
const adsetName = extractAttribute('name');
const mediaType = extractAttribute('mediaType');
const destinationEnvironment = extractAttribute('destinationEnvironment');
// const objective = extractAttribute('objective');
const advertiserId = extractAttribute('advertiserId');

// Columns
const columnsSelect = `
    id,
    type,
    ${adsetName} AS name,
    ${activationStatus} AS activation_status,
    ${deliveryStatus} AS delivery_status,
    CAST(${startDate} AS TIMESTAMP) AS start_date,
    CAST(${endDate} AS TIMESTAMP) AS end_date,
    ${frequencyCap} AS frequency_cap,
    ${maximumImpressions} AS max_impressions,
    ${frequencyCapMode} AS frequency_cap_mode,
    ${bidAmount} AS bid_amount,
    ${bidStrategy} AS bid_strategy,
    ${costControler} AS cost_controler,
    ${budget} AS budget,
    ${budgetDeliverySmoothing} AS delivery_smoothing,
    ${budgetDeliveryWeek} AS delivery_week,
    ${budgetRenewal} AS budget_renewal,
    ${budgetStrategy} AS budget_strategy,
    ${campaignId} AS campaign_id,
    ${datasetId} AS dataset_id,
    ${mediaType} AS media_type,
    ${destinationEnvironment} AS destination_environment,
    ${advertiserId} AS advertiser_id,
`;
    // ${countryOperand} AS country_operand,
    // ${countries} AS country,
    // ${subdivisions} AS subdivision,
    // ${zipCodes} AS zip_code,
    // ${devices} AS devices,
    // ${environments} AS environments,
    // ${operatingSystems} AS operating_systems,
const schema = (ctx) => `
id STRING NOT NULL,
type STRING NOT NULL,
name STRING NOT NULL,
activation_status STRING,
delivery_status STRING,
start_date TIMESTAMP,
end_date TIMESTAMP,
frequency_cap STRING,
max_impressions STRING,
frequency_cap_mode STRING,
bid_amount STRING,
bid_strategy STRING,
cost_controler STRING,
budget STRING,
delivery_smoothing STRING,
delivery_week STRING,
budget_renewal STRING,
budget_strategy STRING,
campaign_id STRING NOT NULL,
dataset_id STRING,
media_type STRING,
destination_environment STRING,
advertiser_id STRING NOT NULL,
PRIMARY KEY (${dimPrimaryKey}) NOT ENFORCED,
FOREIGN KEY (advertiser_id) REFERENCES ${ctx.ref('dim_advertiser')}(id) NOT ENFORCED,
FOREIGN KEY (campaign_id, advertiser_id) REFERENCES ${ctx.ref('dim_campaign')}(id, advertiser_id) NOT ENFORCED
`;
// country_operand ARRAY<STRING>,
// country ARRAY<STRING>,
// subdivision ARRAY<STRING>,
// zip_code ARRAY<STRING>,
// devices ARRAY<STRING>,
// environments ARRAY<STRING>,
// operating_systems ARRAY<STRING>,

// Static
publish(targetTable, {
    type: 'table',
    assertions: assertionsConfig,
    bigquery: bigqueryConfig,
}).query(ctx => `
    SELECT ${columnsSelect}
    FROM ${ctx.ref(sourceTable)}
`).preOps(ctx => `
  DECLARE schema_is_set BOOL DEFAULT FALSE;
`).postOps(ctx => `${createOrReplaceTable(ctx.self(), schema(ctx))}`);
