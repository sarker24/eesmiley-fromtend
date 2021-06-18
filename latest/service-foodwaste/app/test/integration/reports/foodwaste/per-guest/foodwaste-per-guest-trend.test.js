const REGISTRATION_DATE_FORMAT = require('../../../../../src/util/datetime').REGISTRATION_DATE_FORMAT;
const FOODWASTE_REPORT_IDS = require('../../../../../src/services/reports/foodwaste/trend').FOODWASTE_REPORT_IDS['perGuest'];
const { round } = require("../../../../../src/util/math");

const app = require('../../../../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const adminToken = app.get('testLongLivedAdminAccessToken');

const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const findSchema = schemas.get('report-data-response');
const moment = require('moment');
const sinon = require('sinon');
const fixture = require('../../../../fixtures/models');

const { expectedFoodwastePerGuest: [defaultExpectedFoodwastePerGuest] } = fixture.createDefaultPerGuestTargets();

async function validateResponse(schema, response) {
  const { body } = response;
  return await validateSchema(schema, { coerceTypes: true })({ type: 'after', result: body });
}

async function createRegistrations(dateAmounts) {

  for (const dateAmount of dateAmounts) {
    const { date, amount, userId = 1, customerId = 1, registrationPointId = 10070 } = dateAmount;
    await chakram.request('POST', '/registrations', {
      headers: {
        Authorization: 'Bearer ' + adminToken
      },
      body: {
        customerId,
        userId,
        date,
        amount,
        registrationPointId,
        'currency': 'DKK',
        'kgPerLiter': 150,
        'unit': 'kg',
        'manual': true,
        'scale': true
      }
    });
  }
}

async function createGuestRegistrations(dateAmounts) {
  for (const dateAmount of dateAmounts) {
    const { date, amount, customerId = 1, userId = 1 } = dateAmount;
    await chakram.request('POST', '/guest-registrations', {
      headers: {
        Authorization: 'Bearer ' + adminToken
      },
      body: {
        customerId,
        userId,
        date,
        amount
      }
    });
  }
}

describe('foodwaste-per-guest-trend', () => {
  const monthsInTrend = 13; // past year, including current month

  const sandbox = sinon.createSandbox();

  afterEach(() => sandbox.restore());

  it('should return valid response with 0 amounts from past year when no registrations exist', async () => {

    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-trend', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.series[0].id).to.equal(FOODWASTE_REPORT_IDS.trend);
    expectChakram(res.body.series[0].points.length).to.equal(13);
    expectChakram(res.body.metrics.length).to.equal(2);
    expectChakram(res.body.metrics.every(metric =>
      [FOODWASTE_REPORT_IDS.trendBestMonth, FOODWASTE_REPORT_IDS.trendWorstMonth].includes(metric.id) &&
      metric.trend === 0 &&
      metric.point === 0
    )).to.equal(true);
    expectChakram(res.body.extra.target).to.equal(round(defaultExpectedFoodwastePerGuest.amountNormalized));

    await validateResponse(findSchema, res);
  });

  it('should return valid response with amounts from past year', async () => {
    // leap day
    sandbox.stub(moment, 'now').callsFake(() => +new Date(2020, 11, 1));

    const registrations = [
      { date: moment().format(REGISTRATION_DATE_FORMAT), amount: 20000 },
      { date: moment().subtract(1, 'month').format(REGISTRATION_DATE_FORMAT), amount: 20000 },
      { date: moment().subtract(2, 'month').format(REGISTRATION_DATE_FORMAT), amount: 30000 },
      { date: moment().subtract(3, 'month').format(REGISTRATION_DATE_FORMAT), amount: 900000 },
      { date: moment().subtract(4, 'month').format(REGISTRATION_DATE_FORMAT), amount: 10000 }
    ];

    const guestRegistrations = [
      { date: moment().format(REGISTRATION_DATE_FORMAT), amount: 10 },
      { date: moment().subtract(1, 'month').format(REGISTRATION_DATE_FORMAT), amount: 100 },
      { date: moment().subtract(2, 'month').format(REGISTRATION_DATE_FORMAT), amount: 100 },
      { date: moment().subtract(3, 'month').format(REGISTRATION_DATE_FORMAT), amount: 50 },
      { date: moment().subtract(4, 'month').format(REGISTRATION_DATE_FORMAT), amount: 100 }
    ];

    await createRegistrations(registrations);
    await createGuestRegistrations(guestRegistrations);

    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-trend', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expectedWorstMonth = moment()
      .subtract(3, 'month')
      .startOf('month')
      .format(REGISTRATION_DATE_FORMAT);

    const expectedBestMonth = moment()
      .subtract(4, 'month')
      .startOf('month')
      .format(REGISTRATION_DATE_FORMAT);

    const expectedMetricsById = {
      [FOODWASTE_REPORT_IDS.trendBestMonth]: {
        id: FOODWASTE_REPORT_IDS.trendBestMonth,
        unit: 'kg',
        trend: 25,
        point: {
          label: expectedBestMonth,
          value: 10000 / 100
        }
      },
      [FOODWASTE_REPORT_IDS.trendWorstMonth]: {
        id: FOODWASTE_REPORT_IDS.trendWorstMonth,
        unit: 'kg',
        trend: 22400,
        point: {
          label: expectedWorstMonth,
          value: 900000 / 50
        }
      }
    };

    expectChakram(res).to.have.status(200);
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.series[0].id).to.equal(FOODWASTE_REPORT_IDS.trend);
    expectChakram(res.body.series[0].points.length).to.equal(13);
    expectChakram(res.body.metrics.length).to.equal(2);
    expectChakram(res.body.metrics.every(metric =>
      metric.id === expectedMetricsById[metric.id].id &&
      metric.point.label === expectedMetricsById[metric.id].point.label &&
      metric.point.value === expectedMetricsById[metric.id].point.value &&
      metric.unit === expectedMetricsById[metric.id].unit &&
      metric.trend === expectedMetricsById[metric.id].trend
    )).to.equal(true);

    expectChakram(res.body.extra.target).to.equal(round(defaultExpectedFoodwastePerGuest.amountNormalized));
  });

  it('should return valid response with cost amounts from past year', async () => {
    sandbox.stub(moment, 'now').callsFake(() => +new Date(2020, 11, 1));

    const registrations = [
      { date: moment().format(REGISTRATION_DATE_FORMAT), amount: 20000 },
      { date: moment().subtract(1, 'month').format(REGISTRATION_DATE_FORMAT), amount: 20000 },
      { date: moment().subtract(2, 'month').format(REGISTRATION_DATE_FORMAT), amount: 30000 },
      { date: moment().subtract(3, 'month').format(REGISTRATION_DATE_FORMAT), amount: 900000 },
      { date: moment().subtract(4, 'month').format(REGISTRATION_DATE_FORMAT), amount: 10000 }
    ];

    const guestRegistrations = [
      { date: moment().format(REGISTRATION_DATE_FORMAT), amount: 10 },
      { date: moment().subtract(1, 'month').format(REGISTRATION_DATE_FORMAT), amount: 100 },
      { date: moment().subtract(2, 'month').format(REGISTRATION_DATE_FORMAT), amount: 100 },
      { date: moment().subtract(3, 'month').format(REGISTRATION_DATE_FORMAT), amount: 50 },
      { date: moment().subtract(4, 'month').format(REGISTRATION_DATE_FORMAT), amount: 100 }
    ];

    await createRegistrations(registrations);
    await createGuestRegistrations(guestRegistrations);

    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-trend?dimension=cost', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expectedWorstMonth = moment()
      .subtract(3, 'month')
      .startOf('month')
      .format(REGISTRATION_DATE_FORMAT);

    const expectedBestMonth = moment()
      .subtract(4, 'month')
      .startOf('month')
      .format(REGISTRATION_DATE_FORMAT);

    const expectedMetricsById = {
      [FOODWASTE_REPORT_IDS.trendBestMonth]: {
        id: FOODWASTE_REPORT_IDS.trendBestMonth,
        unit: 'DKK',
        trend: -37.5,
        point: {
          label: expectedBestMonth,
          value: 50
        }
      },
      [FOODWASTE_REPORT_IDS.trendWorstMonth]: {
        id: FOODWASTE_REPORT_IDS.trendWorstMonth,
        unit: 'DKK',
        trend: 11150,
        point: {
          label: expectedWorstMonth,
          value: 9000
        }
      }
    };

    expectChakram(res).to.have.status(200);
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.series[0].id).to.equal(FOODWASTE_REPORT_IDS.trend);
    expectChakram(res.body.series[0].points.length).to.equal(13);
    expectChakram(res.body.metrics.length).to.equal(2);
    expectChakram(res.body.metrics.every(metric =>
      metric.id === expectedMetricsById[metric.id].id &&
      metric.point.label === expectedMetricsById[metric.id].point.label &&
      metric.point.value === expectedMetricsById[metric.id].point.value &&
      metric.unit === expectedMetricsById[metric.id].unit &&
      metric.trend === expectedMetricsById[metric.id].trend
    )).to.equal(true);

    expectChakram(res.body.extra.target).to.equal(round(defaultExpectedFoodwastePerGuest.amountNormalized));
  });

});
